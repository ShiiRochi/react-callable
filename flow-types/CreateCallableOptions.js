// @flow

export type CreateCallableOptions = {|
  customRoot: Node | Function,
  dynamicRoot: boolean,
  arguments: Array<string>,
  callableId: string | number,
  async: boolean
|};
