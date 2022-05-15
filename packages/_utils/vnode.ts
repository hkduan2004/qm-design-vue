/*
 * @Author: 焦质晔
 * @Date: 2022-05-15 10:29:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-15 11:01:41
 */
import { Comment, Fragment, Text, isVNode } from 'vue';
import type { VNode, VNodeArrayChildren, VNodeChild, VNodeNormalizedChildren } from 'vue';

export enum PatchFlags {
  TEXT = 1,
  CLASS = 2,
  STYLE = 4,
  PROPS = 8,
  FULL_PROPS = 16,
  HYDRATE_EVENTS = 32,
  STABLE_FRAGMENT = 64,
  KEYED_FRAGMENT = 128,
  UNKEYED_FRAGMENT = 256,
  NEED_PATCH = 512,
  DYNAMIC_SLOTS = 1024,
  HOISTED = -1,
  BAIL = -2,
}

export function isFragment(node: VNode): boolean;
export function isFragment(node: unknown): node is VNode;
export function isFragment(node: unknown): node is VNode {
  return isVNode(node) && node.type === Fragment;
}

export function isText(node: VNode): boolean;
export function isText(node: unknown): node is VNode;
export function isText(node: unknown): node is VNode {
  return isVNode(node) && node.type === Text;
}

export function isComment(node: VNode): boolean;
export function isComment(node: unknown): node is VNode;
export function isComment(node: unknown): node is VNode {
  return isVNode(node) && node.type === Comment;
}

const TEMPLATE = 'template';
export function isTemplate(node: VNode): boolean;
export function isTemplate(node: unknown): node is VNode;
export function isTemplate(node: unknown): node is VNode {
  return isVNode(node) && node.type === TEMPLATE;
}

/**
 * determine if the element is a valid element type rather than fragments and comment e.g. <template> v-if
 * @param node {VNode} node to be tested
 */
export function isValidElementNode(node: VNode): boolean;
export function isValidElementNode(node: unknown): node is VNode;
export function isValidElementNode(node: unknown): node is VNode {
  return isVNode(node) && !isFragment(node) && !isComment(node);
}

/**
 * get a valid child node (not fragment nor comment)
 * @param node {VNode} node to be searched
 * @param depth {number} depth to be searched
 */
function getChildren(node: VNodeNormalizedChildren | VNodeChild, depth: number): VNodeNormalizedChildren | VNodeChild {
  if (isComment(node)) return;
  if (isFragment(node) || isTemplate(node)) {
    return depth > 0 ? getFirstValidNode(node.children, depth - 1) : undefined;
  }
  return node;
}

export const getFirstValidNode = (nodes: VNodeNormalizedChildren, maxDepth = 3) => {
  if (Array.isArray(nodes)) {
    return getChildren(nodes[0], maxDepth);
  } else {
    return getChildren(nodes, maxDepth);
  }
};

export const ensureOnlyChild = (children: VNodeArrayChildren | undefined): VNode => {
  if (!Array.isArray(children) || children.length > 1) {
    throw new Error('expect to receive a single Vue element child');
  }
  return children[0] as VNode;
};
