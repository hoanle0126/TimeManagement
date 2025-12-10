<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class CreateDatabaseIfNotExists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:create-if-not-exists';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động tạo database nếu chưa tồn tại';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $connection = Config::get('database.default');
        $database = Config::get("database.connections.{$connection}.database");
        $host = Config::get("database.connections.{$connection}.host");
        $port = Config::get("database.connections.{$connection}.port");
        $username = Config::get("database.connections.{$connection}.username");
        $password = Config::get("database.connections.{$connection}.password");

        // Chỉ hỗ trợ MySQL và PostgreSQL
        if (!in_array($connection, ['mysql', 'pgsql'])) {
            $this->error("Command này chỉ hỗ trợ MySQL và PostgreSQL");
            return 1;
        }

        try {
            // Tạo kết nối tạm thời không có database
            $tempConfig = Config::get("database.connections.{$connection}");
            $tempConfig['database'] = null;

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
                $this->info("Database '{$database}' đã tồn tại.");
                return 0;
            }

            // Tạo database
            if ($connection === 'mysql') {
                $charset = Config::get("database.connections.{$connection}.charset", 'utf8mb4');
                $collation = Config::get("database.connections.{$connection}.collation", 'utf8mb4_unicode_ci');
                $pdo->exec("CREATE DATABASE `{$database}` CHARACTER SET {$charset} COLLATE {$collation}");
            } else {
                $pdo->exec("CREATE DATABASE \"{$database}\"");
            }

            $this->info("✓ Đã tạo database '{$database}' thành công!");
            return 0;

        } catch (\Exception $e) {
            $this->error("Lỗi khi tạo database: " . $e->getMessage());
            $this->warn("Vui lòng tạo database thủ công:");
            if ($connection === 'mysql') {
                $this->line("  mysql -u {$username} -p -e \"CREATE DATABASE {$database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"");
            } else {
                $this->line("  createdb -U {$username} {$database}");
            }
            return 1;
        }
    }
}
