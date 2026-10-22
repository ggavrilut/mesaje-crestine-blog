<?php
// The contact form's handler (docs/specs/contact-form.md): checks the Turnstile token and the
// fields, then sends one email through the contact@ mailbox's SMTP to the owner, Reply-To the
// reader. Answers JSON. Secrets live in mesaje-crestine-contact.php above public_html, never
// here; the reader never sees a path, a secret or a library error (those go to the error log).
declare(strict_types=1);

// Errors go to the server's log, never into the answer (whatever the host's display_errors).
ini_set('display_errors', '0');
ini_set('log_errors', '1');

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const FAILED = 'Mesajul nu a putut fi trimis. Încercați din nou mai târziu.';

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $log, string $message = FAILED, int $status = 500): void
{
    error_log('contact.php: ' . $log);
    reply($status, ['error' => $message]);
}

/** Characters, not bytes: Romanian letters count once. */
function length(string $s): int
{
    return (int) preg_match_all('/./us', $s);
}

/**
 * The config: MC_CONTACT_CONFIG (local tests only), else the first
 * mesaje-crestine-contact.php above this folder that is not inside public_html, so the
 * preview (public_html/nou) and the live site read the same file.
 */
function config_path(): ?string
{
    $env = getenv('MC_CONTACT_CONFIG');
    if ($env !== false && $env !== '') return is_file($env) ? $env : null;
    for ($dir = __DIR__; ; $dir = dirname($dir)) {
        $file = $dir . '/mesaje-crestine-contact.php';
        if (strpos($file, '/public_html/') === false && is_file($file)) return $file;
        if (dirname($dir) === $dir) return null;
    }
}

function turnstile_ok(string $secret, string $token, string $ip): bool
{
    if (!function_exists('curl_init')) fail('the PHP curl extension is missing');
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $body = curl_exec($ch);
    $error = curl_error($ch);
    if ($body === false) fail('Turnstile siteverify unreachable: ' . $error);
    $result = json_decode((string) $body, true);
    if (!is_array($result)) fail('Turnstile siteverify answered: ' . substr((string) $body, 0, 200));
    if (empty($result['success'])) error_log('contact.php: Turnstile refused: ' . implode(', ', $result['error-codes'] ?? []));
    return !empty($result['success']);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, ['error' => 'Formularul se trimite din pagina site-ului.']);
}

// A filled honeypot is a bot: it gets the success answer, and nothing is sent.
if (trim((string) ($_POST['website'] ?? '')) !== '') reply(200, ['ok' => true]);

$field = function (string $key): string {
    return trim(str_replace(["\r\n", "\r"], "\n", (string) ($_POST[$key] ?? '')));
};
$name = preg_replace('/\s+/u', ' ', $field('name'));
$email = preg_replace('/\s+/u', '', $field('email'));
$message = $field('message');
$page = $field('page');
if ($name === null || $email === null
    || length($name) < 1 || length($name) > 100
    || length($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || length($message) < 1 || length($message) > 5000) {
    reply(400, ['error' => 'Completați numele, o adresă de email validă și mesajul (cel mult 5.000 de caractere).']);
}
// Only the site's own pages are named in the email.
if (!preg_match('#^(https://(nou\.)?mesaje-crestine\.ro|http://(localhost|127\.0\.0\.1)(:\d+)?)/[^\s]*$#', $page)) $page = '';

$path = config_path();
if ($path === null) fail('no mesaje-crestine-contact.php above ' . __DIR__);
$config = require $path;
foreach (['to', 'smtp_password', 'turnstile_secret'] as $key) {
    if (!is_array($config) || empty($config[$key])) fail("config $path has no '$key'");
}

if (!turnstile_ok($config['turnstile_secret'], (string) ($_POST['cf-turnstile-response'] ?? ''), (string) ($_SERVER['REMOTE_ADDR'] ?? ''))) {
    reply(403, ['error' => 'Verificarea anti-spam nu a reușit. Reîncărcați pagina și încercați din nou.']);
}

require __DIR__ . '/_lib/phpmailer/Exception.php';
require __DIR__ . '/_lib/phpmailer/PHPMailer.php';
require __DIR__ . '/_lib/phpmailer/SMTP.php';

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'] ?? 'titan.solutiiweb.com';
    $mail->Port = (int) ($config['smtp_port'] ?? 465);
    $mail->SMTPSecure = $config['smtp_secure'] ?? PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAutoTLS = $mail->SMTPSecure !== '';
    $mail->SMTPAuth = $config['smtp_auth'] ?? true;
    $mail->Username = $config['smtp_user'] ?? 'contact@mesaje-crestine.ro';
    $mail->Password = $config['smtp_password'];
    $mail->Timeout = 15;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->setFrom($config['from'] ?? 'contact@mesaje-crestine.ro', 'Mesaje Creștine (formular)');
    $mail->addAddress($config['to']);
    $mail->addReplyTo($email, $name);
    $mail->Subject = 'Mesaj de pe mesaje-crestine.ro: ' . $name;
    $mail->Body = "Nume: $name\nEmail: $email\n" . ($page !== '' ? "Pagina: $page\n" : '') . "\n$message\n";
    $mail->send();
} catch (Throwable $e) {
    fail('sending failed: ' . $mail->ErrorInfo . ' / ' . $e->getMessage());
}

reply(200, ['ok' => true]);
