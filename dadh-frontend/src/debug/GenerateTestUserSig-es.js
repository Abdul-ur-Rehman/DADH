
import LibGenerateTestUserSig from './lib-generate-test-usersig-es.min.js';

let SDKAPPID = 20025898;

let SECRETKEY = 'cc1761e049018cad20a8b11f2214e68460372e9b9d3f9a5c2acada24fb814465';

/**
 * Expiration time for the signature, it is recommended not to set it too short.
 * Time unit: seconds
 * Default time: 7 x 24 x 60 x 60 = 604800 = 7 days
 */
const EXPIRETIME = 604800;

export function genTestUserSig({ userID, SDKAppID, SecretKey }) {
  if (SDKAppID) SDKAPPID = SDKAppID;
  if (SecretKey) SECRETKEY = SecretKey;
  const generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
  const userSig = generator.genTestUserSig(userID);

  return {
    SDKAppID: SDKAPPID,
    userSig,
  };
}

export default genTestUserSig;