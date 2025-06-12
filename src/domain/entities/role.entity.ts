export default class Role {
    constructor(
        public readonly id_role: number,
        public readonly role_name: string,
        public readonly role_slug: string,
        public readonly role_color: string,
        public readonly canAccess: boolean
    ){}
  }
