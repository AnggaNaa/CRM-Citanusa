import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function LoginSimple() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '3rem 1rem'
        },
        card: {
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        },
        title: {
            fontSize: '1.875rem',
            fontWeight: 'bold',
            textAlign: 'center' as const,
            color: '#111827',
            marginBottom: '0.5rem'
        },
        subtitle: {
            fontSize: '0.875rem',
            textAlign: 'center' as const,
            color: '#6b7280',
            marginBottom: '2rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '1rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            outline: 'none'
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1rem 0'
        },
        demoSection: {
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem'
        },
        demoTitle: {
            textAlign: 'center' as const,
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1rem'
        },
        demoGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            fontSize: '0.75rem'
        },
        demoText: {
            textAlign: 'center' as const,
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            color: '#6b7280'
        },
        error: {
            color: '#dc2626',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
        }
    };

    return (
        <>
            <Head title="Login" />

            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Growth Hubber CRM</h2>
                    <p style={styles.subtitle}>Sign in to your account</p>

                    <form style={styles.form} onSubmit={submit}>
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                style={styles.input}
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <div style={styles.error}>{errors.email}</div>}
                        </div>

                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                style={styles.input}
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <div style={styles.error}>{errors.password}</div>}
                        </div>

                        <div style={styles.checkbox}>
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <label htmlFor="remember-me">Remember me</label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                ...styles.button,
                                ...(processing ? styles.buttonDisabled : {})
                            }}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div style={styles.demoSection}>
                        <div style={styles.demoTitle}>Demo Accounts</div>
                        <div style={styles.demoGrid}>
                            <div>
                                <p><strong>Superadmin:</strong><br />superadmin@example.com</p>
                                <p><strong>Manager:</strong><br />manager@example.com</p>
                            </div>
                            <div>
                                <p><strong>SPV:</strong><br />spv@example.com</p>
                                <p><strong>HA:</strong><br />ha@example.com</p>
                            </div>
                        </div>
                        <p style={styles.demoText}>
                            Password untuk semua akses: <strong>password</strong>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
