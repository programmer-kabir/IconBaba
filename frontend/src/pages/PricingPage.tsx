// frontend/src/pages/PricingPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, User, Users, Plus, Minus, Shield, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/header/SiteHeader';
import { getPricingPlans, getContentPage } from '@/lib/api';
import { PricingPlan, ContentPage } from '@/types/cms';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [pageInfo, setPageInfo] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Team seat counter (default 5, minimum 5)
  const [teamSeats, setTeamSeats] = useState<number>(5);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansRes, pageRes] = await Promise.all([
          getPricingPlans(),
          getContentPage('pricing'),
        ]);

        if (plansRes.success && plansRes.data?.plans) {
          setPlans(plansRes.data.plans);
        }
        if (pageRes.success && pageRes.data) {
          setPageInfo(pageRes.data);
        }
      } catch (err) {
        console.error('Failed to load pricing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate dynamic team price
  const calculateTeamPrice = (basePrice: number, extraSeatPrice: number, seats: number) => {
    const extraSeats = Math.max(0, seats - 5);
    return basePrice + extraSeats * extraSeatPrice;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e15]">
      <SiteHeader />

      <main className="flex-1 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-4">
            <Sparkles className="size-3.5 text-purple-400" />
            Simple & Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {pageInfo?.title || 'Simple, Transparent Pricing'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
            {pageInfo?.meta_description ||
              'Access 5,000+ precision-crafted vector icons. Start solo or collaborate with your team with commercial freedom and zero attribution.'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[520px] rounded-3xl bg-white/[0.02] border border-white/10 p-8"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto items-stretch">
            {plans.map((plan) => {
              const isTeam = plan.name.toLowerCase().includes('team');
              const extraSeatPrice = plan.extra_seat_price || 20;
              const displayPrice = isTeam
                ? calculateTeamPrice(plan.price, extraSeatPrice, teamSeats)
                : plan.price;

              return (
                <div
                  key={plan.id}
                  className="rounded-3xl p-8 sm:p-9 bg-[#11121c] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between shadow-2xl relative"
                >
                  <div>
                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                    {/* Price Header */}
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        ${displayPrice}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">
                        /{plan.billing_period || 'yr'}
                      </span>
                    </div>

                    {/* User Badge / Seat Stepper */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                      {!isTeam ? (
                        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <User className="size-4 text-purple-400" />
                          <span>1 x user</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                              <Users className="size-4 text-purple-400" />
                              <span>{teamSeats} x users</span>
                            </div>
                            <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              +$20/yr per extra seat
                            </span>
                          </div>

                          {/* Seat Stepper Controller */}
                          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-xs text-slate-400 pl-2">Adjust team size:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setTeamSeats((prev) => Math.max(5, prev - 1))}
                                disabled={teamSeats <= 5}
                                className="size-7 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Remove seat (Min 5)"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="text-xs font-bold text-white w-6 text-center">
                                {teamSeats}
                              </span>
                              <button
                                onClick={() => setTeamSeats((prev) => prev + 1)}
                                className="size-7 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                                title="Add seat (+$20/yr)"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features Checklist */}
                    <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="size-4 rounded-full bg-white/10 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="size-2.5 text-slate-200 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Link
                      to={plan.cta_url || '/contact'}
                      className="w-full py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#7c3aed] hover:bg-[#6d28d9] shadow-lg shadow-purple-600/30 flex items-center justify-center transition-all text-center"
                    >
                      {plan.cta_text || `Choose ${plan.name}`}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Free Plan Notice */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            Looking for free icons? Explore 5,000+ icons under our{' '}
            <Link
              to="/licenses/free"
              className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
            >
              Free License
            </Link>
            .
          </p>
        </div>

        {/* 14-Day Guarantee Notice */}
        <div className="mt-12 max-w-xl mx-auto text-center p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto mb-2.5">
            <Shield className="size-4" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">
            14-Day 100% Money-Back Guarantee
          </h4>
          <p className="text-xs text-slate-400">
            Try IconBaba risk-free. If it doesn&apos;t accelerate your workflow, we will issue a full refund within 14 days.
          </p>
        </div>
      </main>
    </div>
  );
}
