import request from 'supertest';
import { Wallet } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../src/app';
import { DriverStatus } from '../../src/modules/drivers/interfaces';
import { DriverDocumentType, KycStatus } from '../../src/modules/kyc/interfaces';
import { UserRole } from '../../src/modules/users/interfaces';
import { UserModel } from '../../src/modules/users/models';

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

const loginAdmin = async () => {
  const auth = await loginWallet();
  await UserModel.findOneAndUpdate(
    { walletAddress: auth.wallet.address.toLowerCase() },
    { $set: { role: UserRole.ADMIN } },
  );
  return auth;
};

const createDriver = async () => {
  const auth = await loginWallet();

  await request(app)
    .patch('/api/v1/users/me')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ role: UserRole.DRIVER });

  const driverResponse = await request(app)
    .post('/api/v1/drivers/profile')
    .set('Authorization', `Bearer ${auth.token}`)
    .send({ fullName: 'KYC Driver' });

  return {
    ...auth,
    driverProfile: driverResponse.body.data,
  };
};

describe('KYC and admin workflows', () => {
  it('starts and fetches a rider KYC application', async () => {
    const { token } = await loginWallet();

    const startResponse = await request(app)
      .post('/api/v1/kyc/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.RIDER });

    expect(startResponse.status).toBe(StatusCodes.OK);
    expect(startResponse.body.success).toBe(true);
    expect(startResponse.body.data.status).toBe(KycStatus.PENDING);
    expect(startResponse.body.data.did).toMatch(/^did:decride:/);

    const getResponse = await request(app)
      .get('/api/v1/kyc/me')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.data).toHaveLength(1);
  });

  it('adds and lists driver document metadata', async () => {
    const { token } = await createDriver();

    const addResponse = await request(app)
      .post('/api/v1/drivers/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: DriverDocumentType.LICENSE,
        fileUrl: 'https://example.com/license.pdf',
        ipfsHash: 'bafy-license-hash',
      });

    expect(addResponse.status).toBe(StatusCodes.CREATED);
    expect(addResponse.body.success).toBe(true);
    expect(addResponse.body.data.type).toBe(DriverDocumentType.LICENSE);
    expect(addResponse.body.data.status).toBe('pending');

    const listResponse = await request(app)
      .get('/api/v1/drivers/documents')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.body.data).toHaveLength(1);
  });

  it('rejects non-admin access to admin KYC routes', async () => {
    const { token } = await loginWallet();

    const response = await request(app)
      .get('/api/v1/admin/kyc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.body.message).toBe('You do not have permission to access this resource');
  });

  it('allows admin to approve driver KYC and update driver status', async () => {
    const driver = await createDriver();
    const admin = await loginAdmin();

    const startResponse = await request(app)
      .post('/api/v1/kyc/start')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ role: UserRole.DRIVER });

    const applicationId = startResponse.body.data.id;

    const listResponse = await request(app)
      .get('/api/v1/admin/kyc')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.body.data.length).toBeGreaterThanOrEqual(1);

    const reviewResponse = await request(app)
      .patch(`/api/v1/admin/kyc/${applicationId}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: KycStatus.APPROVED });

    expect(reviewResponse.status).toBe(StatusCodes.OK);
    expect(reviewResponse.body.data.status).toBe(KycStatus.APPROVED);
    expect(reviewResponse.body.data.vcId).toMatch(/^vc:decride:/);

    const driverStatusResponse = await request(app)
      .patch(`/api/v1/admin/drivers/${driver.driverProfile.id}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: DriverStatus.APPROVED });

    expect(driverStatusResponse.status).toBe(StatusCodes.OK);
    expect(driverStatusResponse.body.data.status).toBe(DriverStatus.APPROVED);
    expect(driverStatusResponse.body.data.kycStatus).toBe('approved');
  });

  it('requires rejection reason when rejecting KYC', async () => {
    const driver = await createDriver();
    const admin = await loginAdmin();

    const startResponse = await request(app)
      .post('/api/v1/kyc/start')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ role: UserRole.DRIVER });

    const response = await request(app)
      .patch(`/api/v1/admin/kyc/${startResponse.body.data.id}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: KycStatus.REJECTED });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toBe('Validation failed');
  });
});
