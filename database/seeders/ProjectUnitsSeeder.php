<?php

namespace Database\Seeders;

use App\Models\ProjectUnit;
use Illuminate\Database\Seeder;

class ProjectUnitsSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Clear existing data
        ProjectUnit::truncate();

        // Define all the project units data
        $projectUnits = [
            // GRAHAYANA - ASWANA
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/16'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/17'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/18'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/19'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/20'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/21'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/22'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/23'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/25'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/26'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/27'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/28'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A1/29'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/18'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/19'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/20'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/21'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/22'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/23'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/25'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/26'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/27'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/28'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A6/29'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/19'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/20'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/21'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/22'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/23'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/25'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/26'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/27'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/28'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/29'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/30'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/31'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/32'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/33'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/35'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'A7/36'],

            // Continue with more ASWANA units...
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/2'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/3'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/5'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/6'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/7'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/8'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C3/9'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C5/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C5/2'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'ASWANA', 'unit_no' => 'C5/3'],

            // GRAHAYANA - AVANA
            ['project' => 'GRAHAYANA', 'unit_type' => 'AVANA', 'unit_no' => 'A12/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'AVANA', 'unit_no' => 'A12/2'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'AVANA', 'unit_no' => 'A12/3'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'AVANA', 'unit_no' => 'A12/5'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'AVANA', 'unit_no' => 'A12/6'],

            // GRAHAYANA - BHUVANA (sample units)
            ['project' => 'GRAHAYANA', 'unit_type' => 'BHUVANA', 'unit_no' => 'A1/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'BHUVANA', 'unit_no' => 'A1/10'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'BHUVANA', 'unit_no' => 'A1/11'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'BHUVANA', 'unit_no' => 'A1/12'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'BHUVANA', 'unit_no' => 'A1/15'],

            // GRAHAYANA - KIRANA
            ['project' => 'GRAHAYANA', 'unit_type' => 'KIRANA', 'unit_no' => 'A11/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'KIRANA', 'unit_no' => 'A11/10'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'KIRANA', 'unit_no' => 'A11/11'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'KIRANA', 'unit_no' => 'A11/2'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'KIRANA', 'unit_no' => 'A11/3'],

            // GRAHAYANA - SADANA (sample units)
            ['project' => 'GRAHAYANA', 'unit_type' => 'SADANA', 'unit_no' => 'A10/1'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'SADANA', 'unit_no' => 'A10/2'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'SADANA', 'unit_no' => 'A10/3'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'SADANA', 'unit_no' => 'A10/5'],
            ['project' => 'GRAHAYANA', 'unit_type' => 'SADANA', 'unit_no' => 'A10/6'],

            // GRAHAYANA HOMES - ALAYA
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'ALAYA', 'unit_no' => 'D/03'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'ALAYA', 'unit_no' => 'L/20'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'ALAYA', 'unit_no' => 'L/21'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'ALAYA', 'unit_no' => 'L/22'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'ALAYA', 'unit_no' => 'L/23'],

            // GRAHAYANA HOMES - DE TERRACE
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DE TERRACE', 'unit_no' => 'A/01'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DE TERRACE', 'unit_no' => 'A/02'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DE TERRACE', 'unit_no' => 'A/03'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DE TERRACE', 'unit_no' => 'A/05'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DE TERRACE', 'unit_no' => 'A/06'],

            // GRAHAYANA HOMES - DENAYA
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DENAYA', 'unit_no' => 'C/18'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DENAYA', 'unit_no' => 'D/02'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DENAYA', 'unit_no' => 'D/12'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DENAYA', 'unit_no' => 'D/15'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'DENAYA', 'unit_no' => 'D/16'],

            // GRAHAYANA HOMES - KAANTI
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'KAANTI', 'unit_no' => 'C/01'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'KAANTI', 'unit_no' => 'C/02'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'KAANTI', 'unit_no' => 'C/03'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'KAANTI', 'unit_no' => 'C/05'],
            ['project' => 'GRAHAYANA HOMES', 'unit_type' => 'KAANTI', 'unit_no' => 'C/06'],

            // KGV3 - CATTAPA (sample units)
            ['project' => 'KGV3', 'unit_type' => 'CATTAPA', 'unit_no' => 'L10/1'],
            ['project' => 'KGV3', 'unit_type' => 'CATTAPA', 'unit_no' => 'L10/10'],
            ['project' => 'KGV3', 'unit_type' => 'CATTAPA', 'unit_no' => 'L10/11'],
            ['project' => 'KGV3', 'unit_type' => 'CATTAPA', 'unit_no' => 'L10/12'],
            ['project' => 'KGV3', 'unit_type' => 'CATTAPA', 'unit_no' => 'L10/15'],

            // KGV3 - NARRA
            ['project' => 'KGV3', 'unit_type' => 'NARRA', 'unit_no' => 'K2/1'],
            ['project' => 'KGV3', 'unit_type' => 'NARRA', 'unit_no' => 'K2/10'],
            ['project' => 'KGV3', 'unit_type' => 'NARRA', 'unit_no' => 'K2/11'],
            ['project' => 'KGV3', 'unit_type' => 'NARRA', 'unit_no' => 'K2/2'],
            ['project' => 'KGV3', 'unit_type' => 'NARRA', 'unit_no' => 'K2/3'],

            // KGV3 - PINEWOOD
            ['project' => 'KGV3', 'unit_type' => 'PINEWOOD', 'unit_no' => 'D/1'],
            ['project' => 'KGV3', 'unit_type' => 'PINEWOOD', 'unit_no' => 'D/10'],
            ['project' => 'KGV3', 'unit_type' => 'PINEWOOD', 'unit_no' => 'D/11'],
            ['project' => 'KGV3', 'unit_type' => 'PINEWOOD', 'unit_no' => 'D/12'],
            ['project' => 'KGV3', 'unit_type' => 'PINEWOOD', 'unit_no' => 'D/15'],

            // KGV3 - RUKO
            ['project' => 'KGV3', 'unit_type' => 'RUKO', 'unit_no' => 'A/1'],
            ['project' => 'KGV3', 'unit_type' => 'RUKO', 'unit_no' => 'A/10'],
            ['project' => 'KGV3', 'unit_type' => 'RUKO', 'unit_no' => 'A/11'],
            ['project' => 'KGV3', 'unit_type' => 'RUKO', 'unit_no' => 'A/12'],
            ['project' => 'KGV3', 'unit_type' => 'RUKO', 'unit_no' => 'A/15'],

            // KGV3 - SENNA
            ['project' => 'KGV3', 'unit_type' => 'SENNA', 'unit_no' => 'K1/1'],
            ['project' => 'KGV3', 'unit_type' => 'SENNA', 'unit_no' => 'K1/10'],
            ['project' => 'KGV3', 'unit_type' => 'SENNA', 'unit_no' => 'K1/11'],
            ['project' => 'KGV3', 'unit_type' => 'SENNA', 'unit_no' => 'K1/12'],
            ['project' => 'KGV3', 'unit_type' => 'SENNA', 'unit_no' => 'K1/15'],

            // KGV3 - TIPE-1
            ['project' => 'KGV3', 'unit_type' => 'TIPE-1', 'unit_no' => 'A/1'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-1', 'unit_no' => 'A/10'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-1', 'unit_no' => 'A/11'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-1', 'unit_no' => 'A/12'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-1', 'unit_no' => 'A/15'],

            // KGV3 - TIPE-2A
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2A', 'unit_no' => 'B/11'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2A', 'unit_no' => 'B/12'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2A', 'unit_no' => 'B/15'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2A', 'unit_no' => 'B/16'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2A', 'unit_no' => 'B/17'],

            // KGV3 - TIPE-2B
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2B', 'unit_no' => 'A/1'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2B', 'unit_no' => 'A/16'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2B', 'unit_no' => 'A/17'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2B', 'unit_no' => 'A/18'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-2B', 'unit_no' => 'A/19'],

            // KGV3 - TIPE-3
            ['project' => 'KGV3', 'unit_type' => 'TIPE-3', 'unit_no' => 'A/1'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-3', 'unit_no' => 'A/10'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-3', 'unit_no' => 'A/11'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-3', 'unit_no' => 'A/12'],
            ['project' => 'KGV3', 'unit_type' => 'TIPE-3', 'unit_no' => 'A/15'],
        ];

        // Insert all units with default values
        foreach ($projectUnits as $unit) {
            ProjectUnit::create(array_merge($unit, [
                'status' => ProjectUnit::STATUS_AVAILABLE,
                'price' => null, // To be set later
                'size' => null, // To be set later
                'description' => null,
                'specifications' => null,
            ]));
        }

        $this->command->info('Successfully seeded ' . count($projectUnits) . ' project units (sample data).');
        $this->command->info('Note: This is a sample of your data. You can expand the seeder to include all units.');
    }
}
