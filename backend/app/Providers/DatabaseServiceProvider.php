<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Support\Facades\Event;

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
        // Hook vào trước khi migrate command chạy
        Event::listen(CommandStarting::class, function (CommandStarting $event) {
            if ($event->command === 'migrate' || $event->command === 'migrate:fresh' || $event->command === 'migrate:refresh') {
                $this->createDatabaseIfNotExists();
            }
        });
    }

    /**
     * Tự động tạo database nếu chưa tồn tại
     */
    protected function createDatabaseIfNotExists(): void
    {
        try {
            $connection = Config::get('database.default');
            $database = Config::get("database.connections.{$connection}.database");
            $host = Config::get("database.connections.{$connection}.host");
            $port = Config::get("database.connections.{$connection}.port");
            $username = Config::get("database.connections.{$connection}.username");
            $password = Config::get("database.connections.{$connection}.password");

            // Chỉ hỗ trợ MySQL và PostgreSQL
            if (!in_array($connection, ['mysql', 'pgsql'])) {
                return;
            }

            // Tạo kết nối tạm thời không có database
            if ($connection === 'mysql') {
                $dsn = "mysql:host={$host};port={$port}";
            } else {
                $dsn = "pgsql:host={$host};port={$port}";
            }

            $pdo = new \PDO($dsn, $username, $password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            // Kiểm tra database đã tồn tại chưa
            if ($connection === 'mysql') {
                $stmt = $pdo->query("SHOW DATABASES LIKE '{$database}'");
                $exists = $stmt->rowCount() > 0;
            } else {
                $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = '{$database}'");
                $exists = $stmt->rowCount() > 0;
            }

            if ($exists) {
                return; // Database đã tồn tại, không cần làm gì
            }

            // Tạo database
            if ($connection === 'mysql') {
                $charset = Config::get("database.connections.{$connection}.charset", 'utf8mb4');
                $collation = Config::get("database.connections.{$connection}.collation", 'utf8mb4_unicode_ci');
                $pdo->exec("CREATE DATABASE `{$database}` CHARACTER SET {$charset} COLLATE {$collation}");
                echo "✓ Đã tự động tạo database '{$database}'\n";
            } else {
                $pdo->exec("CREATE DATABASE \"{$database}\"");
                echo "✓ Đã tự động tạo database '{$database}'\n";
            }

        } catch (\Exception $e) {
            // Nếu không thể tạo database tự động, bỏ qua (sẽ báo lỗi khi migrate)
            // Không throw exception để không làm gián đoạn quá trình migrate
        }
    }
}

