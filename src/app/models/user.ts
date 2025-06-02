export interface UserModel {
	uid:         string;
	bio?:         string;
	name?:        string;
	last_name?:   string;
	email:       string;
	user_name?:   string;
	surnames?:    string;
	mobile?:      string;
	phone?:       string;
	address?:     string;
	city?:        string;
	commune?:     string;
	profession?:  string;
	photoURL?:    string;
	website?:     string;
	github?:      string;
	instagram?:   string;
	twitter?:     string;
	facebook?:    string;
	created_at?:  CreatedAt;
	createdDate?: Date;
}

export interface CreatedAt {
	seconds:     number;
	nanoseconds: number;
}