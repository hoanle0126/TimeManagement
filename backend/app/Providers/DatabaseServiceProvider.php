<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatabaseServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Listen to the migrating event to create database if it doesn't exist
        $this->app['events']->listen('Illuminate\Database\Events\MigrationStarted', function ($event) {
            $connection = $event->connection ?? config('database.default');
            $config = config("database.connections.{$connection}");

            if ($config['driver'] === 'mysql') {
                $database = $config['database'];
                $host = $config['host'];
                $port = $config['port'];
                $username = $config['username'];
                $password = $config['password'];

                try {
                    // Connect to MySQL without selecting a database
                    $pdo = new \PDO(
                        "mysql:host={$host};port={$port}",
                        $username,
                        $password,
                        [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
                    );

                    // Check if database exists
                    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$database}'");
                    $exists = $stmt->fetch();

                    if (!$exists) {
                        // Create database
                        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        Log::info("Database '{$database}' created successfully.");
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to create database: " . $e->getMessage());
                }
            }
        });
    }
}

