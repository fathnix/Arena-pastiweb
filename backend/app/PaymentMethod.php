<?php

namespace App;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case Qris = 'qris';
    case VirtualAccount = 'virtual_account';
    case Ewallet = 'ewallet';
}
