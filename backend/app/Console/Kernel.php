<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('rendimiento:revisar')->everyMinute()->withoutOverlapping();
        $schedule->command('mora:revisar')->dailyAt('08:00')
            ->timezone('America/El_Salvador')->withoutOverlapping();
        $schedule->command('sanctum:prune-expired --hours=24')->daily()->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
