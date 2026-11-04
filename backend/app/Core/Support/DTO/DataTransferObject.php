<?php

namespace App\Core\Support\DTO;

use ReflectionClass;
use ReflectionProperty;

abstract readonly class DataTransferObject
{
    public static function fromArray(array $data): static
    {
        $reflection = new ReflectionClass(static::class);
        $properties = $reflection->getProperties(ReflectionProperty::IS_PUBLIC);
        $args = [];

        foreach ($properties as $property) {
            $name = $property->getName();
            $args[$name] = $data[$name] ?? null;
        }

        return new static(...$args);
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
