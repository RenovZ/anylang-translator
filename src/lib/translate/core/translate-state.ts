import { MARK_ATTRIBUTES } from '@/preset/dom';

// State management for translation operations
// Pre-compiled regex for better performance - removes all mark attributes

class TranslateState {
  translatingNodes = new WeakSet<ChildNode>();
  originalContentMap = new Map<Element, string>();
  MARK_ATTRIBUTES_REGEX = new RegExp(
    `\\s*(?:${[...MARK_ATTRIBUTES].join('|')})(?:=['""][^'"]*['""]|=[^\\s>]*)?`,
    'g'
  );
}

export default new TranslateState();
