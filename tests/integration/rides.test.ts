import request from 'supertest';
import { Wallet } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../src/app';
import {
  DriverKycStatus,
  DriverStatus,
  VehicleType,
} from '../../src/modules/drivers/interfaces';
import { DriverProfileModel } from '../../src/modules/drivers/models';
import { RideCancellationReason, RideStatus } from '../../src/modules/rides/interfaces';
import { UserRole } from '../../src/modules/users/interfaces';

const pickup = {
  latitude: 28.6139,
  longitude: 77.209,
  address: 'India Gate, New Delhi',
};

const dropoff = {
  latitude: 28.5355,
  longitude: 77.391,
  address: 'Noida Sector 18',
};

const loginWallet = async () => {
  const wallet = Wallet.createRandom();
  const nonceResponse = await request(app)
    .post('/api/v1/auth/nonce')
    .send({ walletAddress: wallet.address });
  const signature = await wallet.signMessage(nonceResponse.body.data.message);
  const loginResponse = await request(app)
    .post('/api/v1/auth/verify')
    .send({ walletAddress: wallet.address, signature });

  return {
    wallet,
    token: loginResponse.body.data.accessToken as string,
  };
};

const createApprovedAvailableDriver = async () => {
  const auth = await loginWallet();

  await request(app)
    .patch('/api/v1/users/me')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ role: UserRole.DRIVER });

  const profileResponse = await request(app)
    .post('/api/v1/drivers/profile')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ fullName: 'Ride Driver' });

  await request(app)
    .patch('/api/v1/drivers/location')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ latitude: pickup.latitude, longitude: pickup.longitude });

  await request(app)
    .patch('/api/v1/drivers/availability')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ isAvailable: true });

  await DriverProfileModel.findByIdAndUpdate(profileResponse.body.data.id, {
    $set: {
      status: DriverStatus.APPROVED,
      kycStatus: DriverKycStatus.APPROVED,
      isAvailable: true,
    },
  });

  return {
    ...auth,
    driverProfileId: profileResponse.body.data.id as string,
  };
};

const requestMatchedRide = async () => {
  const rider = await loginWallet();
  const driver = await createApprovedAvailableDriver();

  const rideResponse = await request(app)
    .post('/api/v1/rides')
    .set('Authorization', `Bearer ${rider.token}`)
    .send({ pickup, dropoff, paymentToken: 'RIDE' });

  return {
    rider,
    driver,
    ride: rideResponse.body.data,
    rideResponse,
  };
};

describe('Ride module', () => {
  it('estimates ride fare', async () => {
    const { token } = await loginWallet();

    const response = await request(app)
      .post('/api/v1/rides/estimate')
      .set('Authorization', `Bearer ${token}`)
      .send({ pickup, dropoff, vehicleType: VehicleType.STANDARD });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.estimatedDistanceKm).toBeGreaterThan(0);
    expect(response.body.data.estimatedFare).toBeGreaterThan(0);
    expect(response.body.data.fareBreakdown.currency).toBe('USD');
  });

  it('creates an expired ride when no eligible driver is available', async () => {
    const { token } = await loginWallet();

    const response = await request(app)
      .post('/api/v1/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({ pickup, dropoff, paymentToken: 'USDC' });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe(RideStatus.EXPIRED);
    expect(response.body.data.driverId).toBeNull();
    expect(response.body.data.cancellationReason).toBe(RideCancellationReason.NO_DRIVER_AVAILABLE);
  });

  it('matches a rider with an approved available driver', async () => {
    const { driver, rideResponse } = await requestMatchedRide();

    expect(rideResponse.status).toBe(StatusCodes.CREATED);
    expect(rideResponse.body.data.status).toBe(RideStatus.MATCHED);
    expect(rideResponse.body.data.driverId).toBe(driver.driverProfileId);

    const updatedDriver = await DriverProfileModel.findById(driver.driverProfileId);
    expect(updatedDriver?.isAvailable).toBe(false);
  });

  it('runs the accepted to completed lifecycle for the assigned driver', async () => {
    const { driver, ride } = await requestMatchedRide();

    const acceptResponse = await request(app)
      .post(`/api/v1/rides/${ride.id}/accept`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(acceptResponse.status).toBe(StatusCodes.OK);
    expect(acceptResponse.body.data.status).toBe(RideStatus.ACCEPTED);

    const arrivedResponse = await request(app)
      .post(`/api/v1/rides/${ride.id}/arrived`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(arrivedResponse.status).toBe(StatusCodes.OK);
    expect(arrivedResponse.body.data.status).toBe(RideStatus.ARRIVED);

    const startResponse = await request(app)
      .post(`/api/v1/rides/${ride.id}/start`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(startResponse.status).toBe(StatusCodes.OK);
    expect(startResponse.body.data.status).toBe(RideStatus.ACTIVE);

    const completeResponse = await request(app)
      .post(`/api/v1/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(completeResponse.status).toBe(StatusCodes.OK);
    expect(completeResponse.body.data.status).toBe(RideStatus.COMPLETED);
    expect(completeResponse.body.data.finalFare).toBe(completeResponse.body.data.estimatedFare);

    const updatedDriver = await DriverProfileModel.findById(driver.driverProfileId);
    expect(updatedDriver?.isAvailable).toBe(true);
  });

  it('lists rider and driver rides', async () => {
    const { rider, driver, ride } = await requestMatchedRide();

    const riderListResponse = await request(app)
      .get('/api/v1/rides/me')
      .set('Authorization', `Bearer ${rider.token}`);

    expect(riderListResponse.status).toBe(StatusCodes.OK);
    expect(riderListResponse.body.data).toHaveLength(1);
    expect(riderListResponse.body.data[0].id).toBe(ride.id);

    const driverListResponse = await request(app)
      .get('/api/v1/rides/me')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(driverListResponse.status).toBe(StatusCodes.OK);
    expect(driverListResponse.body.data).toHaveLength(1);
    expect(driverListResponse.body.data[0].id).toBe(ride.id);
  });

  it('rejects invalid lifecycle transitions', async () => {
    const { driver, ride } = await requestMatchedRide();

    const response = await request(app)
      .post(`/api/v1/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.message).toBe('Ride must be active before completion');
  });

  it('allows a rider to cancel a matched ride and releases the driver', async () => {
    const { rider, driver, ride } = await requestMatchedRide();

    const response = await request(app)
      .post(`/api/v1/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${rider.token}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.status).toBe(RideStatus.CANCELLED);
    expect(response.body.data.cancellationReason).toBe(RideCancellationReason.RIDER_CANCELLED);

    const updatedDriver = await DriverProfileModel.findById(driver.driverProfileId);
    expect(updatedDriver?.isAvailable).toBe(true);
  });
});
