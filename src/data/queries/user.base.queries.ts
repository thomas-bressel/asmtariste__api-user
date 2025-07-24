export abstract class UserBaseQueries {

    protected getAllUsersQuery(): string {
        return `SELECT * FROM users`;
    }

    protected getAllUsersWithRoleQuery(): string {
        return `SELECT  *  FROM users u 
                JOIN role r ON r.id_role = u.id_role ;`;
    }

    protected getUserByNicknameQuery(): string {
        return `SELECT * FROM users u
                JOIN role r ON r.id_role = u.id_role
                WHERE u.nickname = ?`;
    }

    protected createUserQuery(): string {
        return `INSERT INTO users (uuid, nickname, firstname, lastname, email, hash_password, avatar, is_activated, id_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    }

    protected  isNicknameExistsQuery(): string {
        return `SELECT * FROM users WHERE nickname = ?`;
    }

    protected  isEmailExistsQuery(): string {
        return `SELECT * FROM users WHERE email = ?`;
    }

    protected toggleActivateQuery(): string {
        return `UPDATE users
            SET is_activated = CASE
                WHEN is_activated = 1 THEN 0 ELSE 1
            END
            WHERE uuid = ?`;
    }

}