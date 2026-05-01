import express from "express";
import request from "supertest";
import { Wallet } from "ethers";
import { StatusCodes } from "http-status-codes";
import { app } from "../../src/app";
import { authenticate, authorizeRoles } from "../../src/middlewares/auth";
import { errorHandler } from "../../src/middlewares/error-handler";
import { UserRole, UserStatus } from "../../src/modules/users/interfaces";
import { UserModel } from "../../src/modules/users/models";

const requestNonce = async (walletAddress: string) =>
  request(app).post("/api/v1/auth/nonce").send({ walletAddress });

describe("Auth module", () => {
  it("generates a wallet nonce for a new user", async () => {
    const wallet = Wallet.createRandom();

    const response = await requestNonce(wallet.address);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nonce).toEqual(expect.any(String));
    expect(response.body.data.message).toContain(response.body.data.nonce);

    const user = await UserModel.findOne({
      walletAddress: wallet.address.toLowerCase(),
    });
    expect(user).toBeTruthy();
    expect(user?.role).toBe(UserRole.RIDER);
    expect(user?.status).toBe(UserStatus.ACTIVE);
  });

  it("verifies a wallet signature and returns an access token", async () => {
    const wallet = Wallet.createRandom();
    const nonceResponse = await requestNonce(wallet.address);
    const signature = await wallet.signMessage(nonceResponse.body.data.message);

    const response = await request(app)
      .post("/api/v1/auth/verify")
      .send({ walletAddress: wallet.address, signature });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.tokenType).toBe("Bearer");
    expect(response.body.data.user.walletAddress).toBe(
      wallet.address.toLowerCase(),
    );
  });

  it("returns authenticated user details with a valid bearer token", async () => {
    const wallet = Wallet.createRandom();
    const nonceResponse = await requestNonce(wallet.address);
    const signature = await wallet.signMessage(nonceResponse.body.data.message);
    const loginResponse = await request(app)
      .post("/api/v1/auth/verify")
      .send({ walletAddress: wallet.address, signature });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.data.accessToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.walletAddress).toBe(wallet.address.toLowerCase());
  });

  it("rejects invalid wallet addresses during nonce generation", async () => {
    const response = await requestNonce("not-a-wallet");

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid wallet address");
  });

  it("rejects invalid wallet signatures", async () => {
    const wallet = Wallet.createRandom();
    const attackerWallet = Wallet.createRandom();
    const nonceResponse = await requestNonce(wallet.address);
    const signature = await attackerWallet.signMessage(
      nonceResponse.body.data.message,
    );

    const response = await request(app)
      .post("/api/v1/auth/verify")
      .send({ walletAddress: wallet.address, signature });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid wallet signature");
  });

  it("rejects protected routes without a bearer token", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authorization bearer token is required",
    );
  });

  it("rejects suspended users during nonce requests", async () => {
    const wallet = Wallet.createRandom();
    await UserModel.create({
      walletAddress: wallet.address.toLowerCase(),
      role: UserRole.RIDER,
      status: UserStatus.SUSPENDED,
      nonce: "existing-nonce",
    });

    const response = await requestNonce(wallet.address);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User account is suspended");
  });

  it("enforces role-based authorization middleware", async () => {
    const wallet = Wallet.createRandom();
    const nonceResponse = await requestNonce(wallet.address);
    const signature = await wallet.signMessage(nonceResponse.body.data.message);
    const loginResponse = await request(app)
      .post("/api/v1/auth/verify")
      .send({ walletAddress: wallet.address, signature });

    const testApp = express();
    testApp.get(
      "/admin-only",
      authenticate,
      authorizeRoles(UserRole.ADMIN),
      (_req, res) => res.status(StatusCodes.OK).json({ success: true }),
    );
    testApp.use(errorHandler);

    const response = await request(testApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${loginResponse.body.data.accessToken}`);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});
