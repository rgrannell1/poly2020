

// -- these modue declarations are _terrible_

declare module "durand-kerner" {
  const findRoots: (coefficients:number[]) => number[][];
  export = findRoots;
}
declare module "zeros" {
  var findRoots: any;
  export = findRoots;
}
declare module "save-pixels" {
  var findRoots: any;
  export = findRoots;
}

declare module "cli-progress" {
  var findRoots: any;
  export = findRoots;
}

declare module "lzma-native" {
  var output: any;
  export = output;
}
