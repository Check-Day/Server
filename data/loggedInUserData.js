/** @format */

let userProfile = {
  userSet: false,
};

let serializedUserProfile = {
  userSet: false,
};

let deserializedUserProfile = {
  userSet: false,
};

let setUserProfile = (profile) => {
  userProfile.userSet = profile;
};

let setSerializedUserProfile = (profile) => {
  userProfile.userSet = profile;
};

let setDeSerializedUserProfile = (profile) => {
  userProfile.userSet = profile;
};

module.exports = {
  userProfile,
  serializedUserProfile,
  deserializedUserProfile,
  setUserProfile,
  setSerializedUserProfile,
  setDeSerializedUserProfile,
};
