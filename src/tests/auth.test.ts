import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  makeJWT,
  validateJWT,
  verifyPassword,
  extractedHeader,
} from "../api/auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await verifyPassword(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Token", () => {
  const firstUser = {
    userID: "user1",
    expiresIn: 3600, // 1 hour
    secret: "mySecretKey1",
  };

  const secondUser = {
    userID: "user2",
    expiresIn: 3600, // 1 hour
    secret: "mySecretKey2",
  };

  let firstToken: string;
  let secondToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    firstToken = await makeJWT(
      firstUser.userID,
      firstUser.expiresIn,
      firstUser.secret,
    );
    secondToken = await makeJWT(
      secondUser.userID,
      secondUser.expiresIn,
      secondUser.secret,
    );
    expiredToken = await makeJWT(firstUser.userID, -1, firstUser.secret);
  });

  it("should return the correct first user ID", async () => {
    const result = await validateJWT(firstToken, firstUser.secret);
    expect(result).toBe(firstUser.userID);
  });

  it("should return the correct second user ID", async () => {
    const result = await validateJWT(secondToken, secondUser.secret);
    expect(result).toBe(secondUser.userID);
  });

  it("should throw for an expired token", () => {
    expect(() => validateJWT(expiredToken, firstUser.secret)).toThrow();
  });

  it("should throw for an diffrent user token", () => {
    expect(() => validateJWT(secondToken, firstUser.secret)).toThrow();
  });
});

describe("Bearer Token Extraction", () => {
  const firstUser = {
    userID: "user1",
    expiresIn: 3600, // 1 hour
    secret: "mySecretKey1",
  };

  const secondUser = {
    userID: "user2",
    expiresIn: 3600, // 1 hour
    secret: "mySecretKey2",
  };

  let firstToken: string;
  let secondToken: string;
  let firstHeader: string;
  let secondHeader: string;
  let invalidHeader: string;

  beforeAll(async () => {
    firstToken = await makeJWT(
      firstUser.userID,
      firstUser.expiresIn,
      firstUser.secret,
    );
    secondToken = await makeJWT(
      secondUser.userID,
      secondUser.expiresIn,
      secondUser.secret,
    );
    firstHeader = `Bearer ${firstToken}`;
    secondHeader = `Bearer ${secondToken}`;
    invalidHeader = `Invalid ${firstToken}`;
  });

  it("should extract the correct first token", async () => {
    const result = await extractedHeader(firstHeader);
    expect(result).toBe(firstToken);
  });

  it("should extract the correct second token", async () => {
    const result = await extractedHeader(secondHeader);
    expect(result).toBe(secondToken);
  });

  it("should throw for an invalid header", () => {
    expect(() => extractedHeader(invalidHeader)).toThrow();
  });
});
