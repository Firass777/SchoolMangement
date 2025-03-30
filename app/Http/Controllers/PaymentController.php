<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Payment;
use App\Models\StudentRecord;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function create(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        if ($request->has('student_nin')) {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'student_nin' => 'required|string'
            ]);

            $user_id = DB::table('users')
                ->where('nin', $request->student_nin)
                ->value('id');

            if (!$user_id) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            $client_reference_id = $user_id;
            $metadata = ['student_nin' => $request->student_nin];
        } else {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'user_id' => 'required'
            ]);

            $client_reference_id = $request->user_id;
            $metadata = [];
        }

        $amount = $request->amount;
        $amountInCents = $amount * 100;

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => ['name' => 'School Fees'],
                    'unit_amount' => $amountInCents, 
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => 'http://localhost:5173/receipt',
            'cancel_url' => 'http://localhost:5173/error',
            'client_reference_id' => $client_reference_id,
            'metadata' => $metadata
        ]);

        return response()->json(['url' => $session->url]);
    }

    public function handleWebhook(Request $request)
    {
        $payload = @file_get_contents('php://input');
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
    
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    
        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            
            $paymentData = [
                'user_id' => $session->client_reference_id,
                'stripe_payment_id' => $session->payment_intent,
                'amount' => $session->amount_total / 100,
                'currency' => strtoupper($session->currency),
                'status' => $session->payment_status,
            ];

            if (isset($session->metadata->student_nin)) {
                $paymentData['student_nin'] = $session->metadata->student_nin;
            }

            $payment = Payment::create($paymentData);
        }
    
        return response()->json(['status' => 'success']);
    }

    public function getChildren(Request $request)
    {
        $nins = explode(',', $request->nins);
        
        $children = DB::table('users')
            ->join('student_records', 'users.nin', '=', 'student_records.student_nin')
            ->whereIn('users.nin', $nins)
            ->select(
                'users.nin',
                'student_records.full_name'
            )
            ->get();
        
        return response()->json($children);
    }

    public function getPayments(Request $request)
    {
        $user_id = $request->user_id;
        $perPage = 5;
        $page = $request->page ?? 1;
        $payments = Payment::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $totalPayments = (float) Payment::where('user_id', $user_id)
            ->sum('amount');

        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments, 
        ]);
    }

    public function getAllPayments(Request $request)
    {
        $user_id = $request->user_id;
    
        $payments = Payment::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();
    
        $totalPayments = (float) Payment::where('user_id', $user_id)
            ->sum('amount');
    
        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments, 
        ]);
    }

    public function getPaymentSummary(Request $request)
    {
        $user_id = $request->user_id;
        
        $studentRecord = StudentRecord::where('student_nin', function($query) use ($user_id) {
            $query->select('nin')
                ->from('users')
                ->where('id', $user_id);
        })->first();

        if (!$studentRecord) {
            return response()->json([
                'error' => 'Student record not found'
            ], 404);
        }

        $payments = Payment::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalPaid = (float) $payments->sum('amount');
        $amountDue = max(0, $studentRecord->payment_amount - $totalPaid);

        return response()->json([
            'total_paid' => $totalPaid,
            'amount_due' => $amountDue,
            'payment_amount' => $studentRecord->payment_amount,
            'pending_payments' => $payments->where('status', 'pending')->sum('amount')
        ]);
    }
    
    public function getPaymentsByMonth()
    {
        $payments = Payment::selectRaw('
            DATE_FORMAT(created_at, "%Y-%m") as month,
            SUM(amount) as amount
        ')
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json(['months' => $payments]);
    }

    public function getPaymentsByWeek()
    {
        $payments = Payment::selectRaw('
            YEAR(created_at) as year,
            WEEK(created_at) as week,
            SUM(amount) as amount
        ')
        ->groupBy('year', 'week')
        ->orderBy('year', 'desc')
        ->orderBy('week', 'desc')
        ->limit(4)
        ->get();
    
        return response()->json(['weeks' => $payments]);
    }

    public function getAllPaymentsAdmin()
    {
        $payments = Payment::orderBy('created_at', 'desc')->get();
        $totalPayments = (float) Payment::sum('amount');

        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments
        ]);
    }

    public function getParentPayments(Request $request)
    {
        $user = json_decode($request->input('user'), true);
        
        if (!$user || !isset($user['children_nin'])) {
            return response()->json(['error' => 'Invalid user data'], 400);
        }
    
        $childrenNin = json_decode($user['children_nin'], true) ?? [];
        
        $payments = Payment::join('users', 'payments.user_id', '=', 'users.id')
            ->join('student_records', 'users.nin', '=', 'student_records.student_nin')
            ->whereIn('users.nin', $childrenNin)
            ->select(
                'payments.*',
                'student_records.full_name as student_name'
            )
            ->orderBy('payments.created_at', 'desc')
            ->paginate(5);
    
        $totalPayments = (float) Payment::whereIn('user_id', function($query) use ($childrenNin) {
                $query->select('id')
                    ->from('users')
                    ->whereIn('nin', $childrenNin);
            })
            ->sum('amount');
    
        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments, 
        ]);
    }
    
    public function getAllParentPayments(Request $request)
    {
        $user = json_decode($request->input('user'), true);
        
        if (!$user || !isset($user['children_nin'])) {
            return response()->json(['error' => 'Invalid user data'], 400);
        }
    
        $childrenNin = json_decode($user['children_nin'], true) ?? [];
        
        $payments = Payment::join('users', 'payments.user_id', '=', 'users.id')
            ->join('student_records', 'users.nin', '=', 'student_records.student_nin')
            ->whereIn('users.nin', $childrenNin)
            ->select(
                'payments.*',
                'student_records.full_name as student_name'
            )
            ->orderBy('payments.created_at', 'desc')
            ->get();
    
        $totalPayments = (float) Payment::whereIn('user_id', function($query) use ($childrenNin) {
                $query->select('id')
                    ->from('users')
                    ->whereIn('nin', $childrenNin);
            })
            ->sum('amount');
    
        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments, 
        ]);
    }
    
    public function getParentPaymentSummary(Request $request)
    {
        $user = json_decode($request->input('user'), true);
        
        if (!$user || !isset($user['children_nin'])) {
            return response()->json(['error' => 'Invalid user data'], 400);
        }
    
        $childrenNin = json_decode($user['children_nin'], true) ?? [];
        
        $childrenRecords = StudentRecord::whereIn('student_nin', $childrenNin)
            ->get();
    
        $childrenUsers = DB::table('users')
            ->whereIn('nin', $childrenNin)
            ->select('id', 'nin')
            ->get();
    
        $payments = Payment::whereIn('user_id', $childrenUsers->pluck('id'))
            ->orderBy('created_at', 'desc')
            ->get();
    
        $totalPaid = (float) $payments->sum('amount');
        $totalAmountDue = $childrenRecords->sum('payment_amount') - $totalPaid;
        $amountDue = max(0, $totalAmountDue);
    
        return response()->json([
            'total_paid' => $totalPaid,
            'amount_due' => $amountDue,
            'total_payment_amount' => $childrenRecords->sum('payment_amount'),
            'pending_payments' => $payments->where('status', 'pending')->sum('amount'),
            'children' => $childrenRecords->map(function($record) use ($payments, $childrenUsers) {
                $userId = $childrenUsers->where('nin', $record->student_nin)->first()->id ?? null;
                $childPayments = $payments->where('user_id', $userId);
                
                return [
                    'name' => $record->full_name,
                    'user_id' => $userId,
                    'total_paid' => $childPayments->sum('amount'),
                    'amount_due' => max(0, $record->payment_amount - $childPayments->sum('amount'))
                ];
            })
        ]);
    }
}