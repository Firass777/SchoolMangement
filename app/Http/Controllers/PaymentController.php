<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function create(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Get the amount from the request (in dollars)
        $amount = $request->amount;

        // Convert the amount to cents (Stripe requires amounts in cents)
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
            'client_reference_id' => $request->user_id,
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
            
            $payment = Payment::create([
                'user_id' => $session->client_reference_id,
                'stripe_payment_id' => $session->payment_intent,
                'amount' => $session->amount_total / 100,
                'currency' => strtoupper($session->currency),
                'status' => $session->payment_status,
            ]);
    
            // Save payment details in local storage (for demo purposes)
            // In a real app, you would fetch this data from the database
            $paymentDetails = [
                'user_id' => $session->client_reference_id,
                'amount' => $session->amount_total / 100,
                'created_at' => $payment->created_at,
                'stripe_payment_id' => $session->payment_intent,
                'status' => $session->payment_status,
            ];
            // You can use a queue or another method to update the frontend
        }
    
        return response()->json(['status' => 'success']);
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
    
        // Fetch all payments for the user
        $payments = Payment::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();
    
        // Calculate total payments 
        $totalPayments = (float) Payment::where('user_id', $user_id)
            ->sum('amount');
    
        return response()->json([
            'payments' => $payments,
            'totalPayments' => $totalPayments, 
        ]);
    }
}