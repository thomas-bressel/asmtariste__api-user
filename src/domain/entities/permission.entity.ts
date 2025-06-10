export default class PermissionEntity {
    constructor(
        public readonly id_permission: number,
        public readonly code: string,
        public readonly name: string,
        public readonly description: string | null,
        public readonly category: string | null
    ){}
    }
  