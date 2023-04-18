export interface VecFindOption {
	k?: number;
	threshold?: number;
}

export interface ObjFindOption {
	k?: number;
	weight?: number;
}

export type FindOption = VecFindOption & ObjFindOption;
