<?php

namespace App\Http\Controllers\Api;

use App\Classes\Response;
use App\CompanyCard;
use App\Http\Controllers\Controller;
use App\Stamp;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{

    public function login(Request $request)
    {
        $data = $request->data;
        if (isset($data['email']) && isset($data['password'])) {
            if (Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
                return Response::json(['status' => "success", 'data' => json_encode(Auth::user())], 200);
            }
        }
        return Response::json(['status' => 'failed', 'data' => 'Credentials are not recognized.'], 401);
    }

    public function cards()
    {
        $user = Auth::user();
        $stamps = Stamp::where('user_id', $user->id)->get();
        $cardIds = [];
        $cards = [];

        foreach ($stamps as $stamp) {
            if (!in_array($stamp->company_card_id, $cardIds)) {
                array_push($cardIds, $stamp->card_id);
                array_push($cards, json_encode(CompanyCard::where('id', $stamp->card_id)->first()));
            }
        }

        return Response::json([
            "status" => "success",
            "data" => [
                $cards
            ]
        ], 200);
    }

    public function card($card)
    {
        $card = CompanyCard::find($card);
        $stamps = null;
        $status = 'failed';

        if ($card) {
            $status = 'success';
            $stampCard = Stamp::where('user_id', Auth::user()->id)
                ->where('card_id', $card->id)->first();
            $stamps = isset($stampCard) && isset($stampCard->stamp_count) ? $stampCard->stamp_count : 0;
        }

        return Response::json([
            "status" => $status,
            "data" => [
                'card' => json_encode($card),
                'stamps' => $stamps
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $request->data;
        $validator = Validator::make($data, [
            'name' => 'required|max:255',
            'city' => 'required|max:255',
            'email' => 'required|unique:users|email|max:255',
            'password' => 'required|max:255',
        ]);

        if ($validator->fails()) {
            return Response::json(['error' => json_encode($validator->getMessageBag()->toArray()), "data" => json_encode($request->input('data'))], 422);
        } else {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'city' => $data['city'],
                'password' => Hash::make($data['password']),
                'api_token' => Str::random(60),
            ]);
            return Response::json(['status' => "success", "data" => $user], 200);
        }
    }

    public function update(Request $request)
    {
        $data = $request->data;
        $validator = Validator::make($data, [
            'name' => 'required|max:255',
            'city' => 'required|max:255',
            'email' => 'required|unique:users|email|max:255',
        ]);

        if ($validator->fails()) {
            return Response::json(['error' => json_encode($validator->getMessageBag()->toArray()), "data" => json_encode($request->input('data'))], 422);
        } else {
            $user = User::where('api_token', $request->header('token'))->first();
            $user->name = $data['name'];
            $user->city = $data['city'];
            $user->password = Hash::make($data['password']);
            $user->email = $data['email'];
            $user->update();

            return Response::json(['status' => "success", "data" => $user], 200);
        }


    }

    public function show()
    {
        return response()->json(['user' => Auth::user()]);
    }
}
