export default class User {
    constructor(
    public readonly id_user: number,
    public readonly uuid: string,
    public readonly nickname: string,
    public readonly email: string,
    public readonly hash_password: string,
    public readonly firstname: string | null,
    public readonly lastname: string | null,
    public readonly avatar: string,
    public readonly registration_date: Date,
    public readonly last_login: Date,
    public readonly is_activated: boolean,
    public readonly id_role: number,
    ) {}
  }
  