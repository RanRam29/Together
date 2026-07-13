BEGIN;
SELECT plan(2);

-- Since we are testing RPC rate limits, testing time-based rate limits directly is hard without mocking time.
-- We can just ensure the function `enforce_rate_limit` exists and doesn't fail on the first call, 
-- but fails when count exceeds max.

-- Let's test enforce_rate_limit directly as authenticated user
SET role TO postgres;
INSERT INTO auth.users (id, role) VALUES ('00000000-0000-0000-0000-000000000001', 'authenticated') ON CONFLICT DO NOTHING;
SET role TO authenticated;
SET request.jwt.claim.sub TO '00000000-0000-0000-0000-000000000001'; -- seed user

SELECT lives_ok(
    $$SELECT public.enforce_rate_limit('test_action'::text, 1::integer, '1 hour'::interval)$$,
    'First call succeeds'
);

-- Second call should fail since max is 1
SELECT throws_ok(
    $$SELECT public.enforce_rate_limit('test_action'::text, 1::integer, '1 hour'::interval)$$,
    'Rate limit exceeded for test_action',
    'Second call throws rate limit exception'
);

SELECT * FROM finish();
ROLLBACK;
