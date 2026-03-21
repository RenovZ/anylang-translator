import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import { bottts } from '@dicebear/collection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dicebear = (username: string | undefined, options = {}) => {
  const defaultOptions = { seed: username };
  const avatar = createAvatar(initials, {
    ...options,
    ...defaultOptions
  });
  return avatar.toDataUri();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anylang = (options = {}) => {
  const defaultOptions = { seed: "anylang bot" };
  const avatar = createAvatar(bottts, {
    ...options,
    ...defaultOptions
  });
  return avatar.toDataUri();
};

export default {
  dicebear,
  anylang
};
