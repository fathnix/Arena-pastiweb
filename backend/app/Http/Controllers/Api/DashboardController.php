<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Scope a booking query to the user's branch, or all branches for superadmin.
     */
    private function scoped(Request $request): Builder
    {
        $query = Booking::query();

        if (! $request->user()->isSuperadmin()) {
            $branchId = $request->user()->branch_id ?? Branch::query()->value('id');
            $query->where('branch_id', $branchId);
        }

        return $query;
    }

    public function stats(Request $request)
    {
        $today = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();
        $base = $this->scoped($request);

        return response()->json([
            'today_bookings' => (clone $base)->where('booking_date', $today)
                ->whereNotIn('status', ['cancelled', 'expired'])->count(),
            'today_revenue' => (int) (clone $base)->where('booking_date', $today)
                ->where('payment_status', 'paid')->sum('total'),
            'monthly_revenue' => (int) (clone $base)->where('booking_date', '>=', $thisMonth)
                ->where('payment_status', 'paid')->sum('total'),
            'pending_payments' => (clone $base)->where('status', 'pending_payment')->count(),
            'upcoming_bookings' => (clone $base)->where('booking_date', '>=', $today)
                ->where('status', 'confirmed')->count(),
        ]);
    }

    public function revenueChart(Request $request)
    {
        $days = (int) $request->get('days', 7);

        $data = $this->scoped($request)
            ->where('booking_date', '>=', now()->subDays($days)->toDateString())
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(booking_date) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function peakHours(Request $request)
    {
        $bookingIds = $this->scoped($request)
            ->where('booking_date', '>=', now()->subDays(30)->toDateString())
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->pluck('id');

        $data = DB::table('booking_slots')
            ->join('time_slots', 'booking_slots.time_slot_id', '=', 'time_slots.id')
            ->whereIn('booking_slots.booking_id', $bookingIds)
            ->select('time_slots.label', DB::raw('COUNT(*) as bookings'))
            ->groupBy('time_slots.label', 'time_slots.sort_order')
            ->orderBy('time_slots.sort_order')
            ->get();

        return response()->json($data);
    }

    public function branchPerformance(Request $request)
    {
        if (! $request->user()->isSuperadmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = Branch::query()
            ->withCount(['fields'])
            ->get()
            ->map(function (Branch $branch) {
                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                    'fields' => $branch->fields_count,
                    'bookings' => Booking::where('branch_id', $branch->id)
                        ->whereNotIn('status', ['cancelled', 'expired'])->count(),
                    'revenue' => (int) Booking::where('branch_id', $branch->id)
                        ->where('payment_status', 'paid')->sum('total'),
                ];
            });

        return response()->json($data);
    }
}
