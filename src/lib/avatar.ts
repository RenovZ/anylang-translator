import { bottts, initials } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

const dicebear = (username: string | undefined, options = {}) => {
  const defaultOptions = { seed: username };
  const avatar = createAvatar(initials, {
    ...options,
    ...defaultOptions
  });
  return avatar.toDataUri();
};

const anylang = (options = {}) => {
  const defaultOptions = { seed: 'anylang bot' };
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
