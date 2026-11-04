<?php

namespace App\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasHeader('X-Request-ID')) {
            $request->headers->set('X-Request-ID', uniqid('req_', true));
        }

        $response = $next($request);

        if (method_exists($response, 'header')) {
            $response->header('X-Request-ID', $request->header('X-Request-ID'));
        }

        return $response;
    }
}
