import request from 'supertest';
import { Wallet } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../src/app';
import { UserRole } from '../../src/modules/users/interfaces';
import { VehicleType } from '../../src/modules/drivers/interfaces';

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

describe('Profile modules', () => {
  it('updates the authenticated user profile', async () => {
    const { token } = await loginWallet();

    const response = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'rider@example.com', phone: '+15555550123' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('rider@example.com');
    expect(response.body.data.phone).toBe('+15555550123');
  });

  it('creates and fetches a rider profile', async () => {
    const { token } = await loginWallet();

    const createResponse = await request(app)
      .post('/api/v1/riders/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Alice Rider',
        avatarUrl: 'https://example.com/alice.png',
        defaultPaymentMethod: 'RIDE',
      });

    expect(createResponse.status).toBe(StatusCodes.OK);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.fullName).toBe('Alice Rider');

    const getResponse = await request(app)
      .get('/api/v1/riders/me')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.data.fullName).toBe('Alice Rider');
  });

  it('creates a driver profile after the user switches to driver role', async () => {
    const { token } = await loginWallet();

    await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.DRIVER });

    const response = await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Bob Driver' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe('Bob Driver');
    expect(response.body.data.status).toBe('pending');
    expect(response.body.data.isAvailable).toBe(false);
  });

  it('updates driver availability and location', async () => {
    const { token } = await loginWallet();

    await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.DRIVER });

    await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Carol Driver' });

    const availabilityResponse = await request(app)
      .patch('/api/v1/drivers/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ isAvailable: true });

    expect(availabilityResponse.status).toBe(StatusCodes.OK);
    expect(availabilityResponse.body.data.isAvailable).toBe(true);

    const locationResponse = await request(app)
      .patch('/api/v1/drivers/location')
      .set('Authorization', `Bearer ${token}`)
      .send({ latitude: 28.6139, longitude: 77.2090 });

    expect(locationResponse.status).toBe(StatusCodes.OK);
    expect(locationResponse.body.data.currentLocation).toEqual({
      type: 'Point',
      coordinates: [77.209, 28.6139],
    });
  });

  it('adds and lists driver vehicles', async () => {
    const { token } = await loginWallet();

    await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.DRIVER });

    await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Dan Driver' });

    const vehicleResponse = await request(app)
      .post('/api/v1/drivers/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'Black',
        plateNumber: 'dl01ab1234',
        vehicleType: VehicleType.ELECTRIC,
      });

    expect(vehicleResponse.status).toBe(StatusCodes.CREATED);
    expect(vehicleResponse.body.success).toBe(true);
    expect(vehicleResponse.body.data.plateNumber).toBe('DL01AB1234');
    expect(vehicleResponse.body.data.vehicleType).toBe(VehicleType.ELECTRIC);

    const listResponse = await request(app)
      .get('/api/v1/drivers/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].make).toBe('Tesla');
  });

  it('rejects rider access to driver profile creation', async () => {
    const { token } = await loginWallet();

    const response = await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Unauthorized Driver' });

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.body.message).toBe('Only driver accounts can manage driver profiles');
  });
});
