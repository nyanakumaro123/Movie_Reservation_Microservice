<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Movie Reservation Checkout</title>

    @fonts

    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <script src="https://cdn.tailwindcss.com"></script>
    @endif

    <script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="{{ env('MIDTRANS_CLIENT_KEY') }}"></script>
</head>

<body
    class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] flex p-6 lg:p-8 items-center lg:justify-center min-h-screen flex-col">

    <div
        class="flex items-center justify-center w-full transition-opacity opacity-100 duration-750 lg:grow starting:opacity-0">
        <main
            class="flex max-w-[335px] w-full flex-col-reverse lg:max-w-4xl lg:flex-row shadow-lg rounded-lg overflow-hidden">

            <div class="flex-1 p-6 pb-6 lg:p-12 bg-white dark:bg-[#161615] dark:text-[#EDEDEC]">
                <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h1>

                <div class="space-y-4 mb-8">
                    <div class="flex justify-between border-b dark:border-gray-700 pb-4">
                        <div>
                            <h3 class="font-semibold text-lg">Cyberpunk 2077: Edge of the Web</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Sun, 24 March 2026 • 19:30 WIB</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Studio 2 • Seats: F10, F11</p>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Tickets (2x)</span>
                        <span class="font-medium">Rp 120.000</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Convenience Fee</span>
                        <span class="font-medium">Rp 0</span>
                    </div>

                    <div class="flex justify-between items-center pt-4 border-t dark:border-gray-700 mt-4">
                        <span class="font-bold text-lg">Total Payment</span>
                        <span class="font-bold text-lg text-[#F53003]">Rp 120.000</span>
                    </div>
                </div>

                <button id="pay-button"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F53003] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                    Pay with Midtrans
                </button>
                <p class="text-xs text-center text-gray-500 mt-4">
                    Secure payment processed via Midtrans.
                </p>
            </div>

            <div
                class="bg-gray-900 relative lg:-ml-px -mb-px lg:mb-0 aspect-video lg:aspect-auto w-full lg:w-[438px] shrink-0 overflow-hidden flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop"
                    alt="Movie Poster" class="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay">

                <div class="relative z-10 text-center p-8">
                    <div class="inline-block p-4 rounded-full bg-white/10 backdrop-blur-md mb-4 border border-white/20">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z">
                            </path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white tracking-wider uppercase">Cinema TIX</h2>
                </div>
            </div>

        </main>
    </div>

    <script type="text/javascript">
        var payButton = document.getElementById('pay-button');

        payButton.addEventListener('click', function(e) {
            e.preventDefault();

            // 🎯 RUNNING MOCK FLOW (Use this while testing offline without real keys)
            alert("🎯 Mock Mode: Simulating Midtrans Payment Popup...");

            setTimeout(function() {
                alert("✅ Mock Payment Successful! Redirecting...");
                window.location.href = "/payment-success";
            }, 1000);

            window.snap.pay('{{ $snapToken ?? '' }}', {
                onSuccess: function(result) {
                    window.location.href = "/payment-success";
                },
                onPending: function(result) {
                    alert("Waiting for your payment!");
                },
                onError: function(result) {
                    alert("Payment failed!");
                }
            });
        });
    </script>
</body>

</html>
