<?php

namespace App\Http\Controllers\Admin;

use App\Classes\Response;
use App\Company;
use App\Goal;
use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GoalController extends Controller
{
    public function index()
    {
        $companiesResult = Company::where('created_by', Auth::user()->id)->get();
        $companies = [];

        foreach ($companiesResult as $companyResult) {
            $goalsResult = Goal::where('company_id', $companyResult->id)->get()->toArray();
            $companies[$companyResult->id] = [];
            $companies[$companyResult->id]['company_data'] = $companyResult;
            $companies[$companyResult->id]['goals_data'] = $goalsResult;
        }

        return view('admin.goal.index', compact('companies'));
    }

    public function create(Company $company)
    {
        return view('admin.goal.create', compact('company'));
    }

    public function store(Company $company, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        } else {
            Goal::create([
                'name' => $request->input('name'),
                'company_id' => $company->id,
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
            ]);

            return redirect()->route('goal.index');
        }
    }

    public function edit(Company $company, Goal $goal)
    {
        if ($goal->created_by !== Auth::user()->id) {
            abort(403);
        }

        return view('admin.goal.edit', compact('goal', 'company'));
    }

    public function delete(Company $company, Goal $goal)
    {
        if ($goal->created_by !== Auth::user()->id) {
            abort(403);
        }

        $goal->delete();
        return redirect()->route('goal.index');
    }

    public function update(Company $company, Goal $goal, Request $request)
    {
        if ($goal->created_by !== Auth::user()->id) {
            abort(403);
        }

        if (!empty($request->input('password'))) {
            return redirect()->route('goal.index');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        } else {
            $goal->name = $request->input('name');
            $goal->updated_by = Auth::user()->id;
            $goal->update();

            return redirect()->route('goal.index');
        }


    }
}
