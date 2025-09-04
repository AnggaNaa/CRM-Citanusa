<?php

namespace App\Http\Controllers;

use App\Models\ProjectUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ProjectUnitController extends Controller
{
    /**
     * Display a listing of project units.
     */
    public function index(Request $request)
    {
        $query = ProjectUnit::query();

        // Apply filters
        if ($request->filled('project')) {
            $query->where('project', $request->project);
        }

        if ($request->filled('unit_type')) {
            $query->where('unit_type', $request->unit_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('unit_no', 'LIKE', "%{$search}%")
                  ->orWhere('project', 'LIKE', "%{$search}%")
                  ->orWhere('unit_type', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sort by project, unit_type, then unit_no
        $query->orderBy('project')
              ->orderBy('unit_type')
              ->orderBy('unit_no');

        $units = $query->paginate(50)->appends($request->query());

        return Inertia::render('ProjectUnits/Index', [
            'units' => $units,
            'filters' => $request->only(['project', 'unit_type', 'status', 'search']),
            'projects' => ProjectUnit::getProjects(),
            'unitTypes' => ProjectUnit::getUnitTypes(),
            'statuses' => ProjectUnit::getStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new project unit.
     */
    public function create()
    {
        return Inertia::render('ProjectUnits/Create', [
            'projects' => ProjectUnit::getProjects(),
            'unitTypes' => ProjectUnit::getUnitTypes(),
            'statuses' => ProjectUnit::getStatuses(),
        ]);
    }

    /**
     * Store a newly created project unit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project' => 'required|string|max:255',
            'unit_type' => 'required|string|max:255',
            'unit_no' => 'required|string|max:255',
            'status' => 'required|in:available,reserved,sold,blocked',
            'price' => 'nullable|numeric|min:0',
            'size' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        try {
            ProjectUnit::create($validated);

            return redirect()->route('project-units.index')
                ->with('success', 'Project unit created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating project unit: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Failed to create project unit. This unit may already exist.'
            ])->withInput();
        }
    }

    /**
     * Display the specified project unit.
     */
    public function show(ProjectUnit $projectUnit)
    {
        $projectUnit->load(['leads' => function ($query) {
            $query->with(['assignedTo', 'createdBy'])->latest();
        }]);

        return Inertia::render('ProjectUnits/Show', [
            'unit' => $projectUnit,
        ]);
    }

    /**
     * Show the form for editing the specified project unit.
     */
    public function edit(ProjectUnit $projectUnit)
    {
        return Inertia::render('ProjectUnits/Edit', [
            'unit' => $projectUnit,
            'projects' => ProjectUnit::getProjects(),
            'unitTypes' => ProjectUnit::getUnitTypes(),
            'statuses' => ProjectUnit::getStatuses(),
        ]);
    }

    /**
     * Update the specified project unit.
     */
    public function update(Request $request, ProjectUnit $projectUnit)
    {
        $validated = $request->validate([
            'project' => 'required|string|max:255',
            'unit_type' => 'required|string|max:255',
            'unit_no' => 'required|string|max:255',
            'status' => 'required|in:available,reserved,sold,blocked',
            'price' => 'nullable|numeric|min:0',
            'size' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        try {
            $projectUnit->update($validated);

            return redirect()->route('project-units.index')
                ->with('success', 'Project unit updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating project unit: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Failed to update project unit. The new unit combination may already exist.'
            ])->withInput();
        }
    }

    /**
     * Remove the specified project unit.
     */
    public function destroy(ProjectUnit $projectUnit)
    {
        try {
            // Check if unit has associated leads
            if ($projectUnit->leads()->count() > 0) {
                return back()->withErrors([
                    'error' => 'Cannot delete unit with associated leads.'
                ]);
            }

            $projectUnit->delete();

            return redirect()->route('project-units.index')
                ->with('success', 'Project unit deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting project unit: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Failed to delete project unit.'
            ]);
        }
    }

    /**
     * Get unit types for a specific project (API endpoint)
     */
    public function getUnitTypes(Request $request)
    {
        $project = $request->get('project');
        $unitTypes = ProjectUnit::getUnitTypes($project);

        return response()->json($unitTypes);
    }

    /**
     * Get units for a specific project and type (API endpoint)
     */
    public function getUnits(Request $request)
    {
        $project = $request->get('project');
        $unitType = $request->get('unit_type');

        $units = ProjectUnit::getUnits($project, $unitType);

        return response()->json($units);
    }
}
