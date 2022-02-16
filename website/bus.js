/*
 * @Author: 焦质晔
 * @Date: 2021-03-17 15:21:44
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-17 15:51:49
 */
import mitt from 'mitt';

const emitter = mitt();
emitter.$off = emitter.off;
emitter.$on = emitter.on;
emitter.$emit = emitter.emit;

export default emitter;
