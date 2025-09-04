<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\User;

class UpdateLeadPrioritiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing leads with old priority values to new ones
        $priorityMapping = [
            'low' => 'Cold',
            'medium' => 'Warm',
            'high' => 'Hot',
            'urgent' => 'Booking',
            'cold' => 'Cold',
            'warm' => 'Warm',
            'hot' => 'Hot',
            'booking' => 'Booking',
            'closing' => 'Closing',
            'lost' => 'Lost'
        ];

        foreach ($priorityMapping as $oldPriority => $newPriority) {
            Lead::where('priority', $oldPriority)->update(['priority' => $newPriority]);
        }

        // Ensure all leads have project field filled
        Lead::whereNull('project')->orWhere('project', '')->update(['project' => 'General Project']);

        // Ensure all leads are assigned to HA users
        $haUsers = User::role('ha')->pluck('id');
        if ($haUsers->isNotEmpty()) {
            Lead::whereNull('assigned_to')->orWhereNotIn('assigned_to', $haUsers)
                ->update(['assigned_to' => $haUsers->first()]);
        }

        // Update priority_changed_at for existing leads
        Lead::whereNull('priority_changed_at')->update(['priority_changed_at' => now()]);

        $this->command->info('Lead priorities updated successfully!');
    }
}
