<?php

namespace App;

enum UserRole: string
{
    case Superadmin = 'superadmin';
    case Admin = 'admin';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Superadmin => 'Super Admin',
            self::Admin => 'Admin / Kasir',
            self::Customer => 'Customer',
        };
    }
}
