import HeroCarousel from '../components/home/Herocarousel'
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import OurServices from '../components/home/OurServices';
import MeetOurTeam from '../components/home/MeetOutTeams';
import CommunityStats from '../components/home/Communitystats';
import FAQ from '../components/home/HomeFaq';
import { Link } from 'react-router-dom';

const highlights = [
  'Quality education for underprivileged children',
  'Free medical camps & healthcare support',
  'Community welfare & social equality programs',
];

const Home = () => {


  return (
    <main>
      <HeroCarousel />
      <section className="bg-white py-16 lg:py-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* ── Left: Image ── */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=900&q=85&fit=crop&crop=faces"
                  alt="Al Kareem community"
                  className="w-full h-[300px] md:h-[420px] lg:h-[500px] 3xl:h-[560px] object-cover object-top"
                />

                {/* Bottom scrim for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent" />

                {/* Caption pinned to bottom-left */}
                <div className="absolute bottom-10 sm:bottom-6 left-6 right-6">
                  <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-1">
                    Bhopal, India · Est. 2012
                  </p>
                  <p className="text-white text-lg font-bold leading-snug">
                    Serving the community for over a decade
                  </p>
                </div>
              </div>

              {/* Small inset image — offset bottom right */}
              <div className="absolute -bottom-8 -right-4 lg:-right-10 size-25 sm:w-44 sm:h-44 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80&fit=crop"
                  alt="Volunteers at work"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* ── Right: Content ── */}
            <div className="lg:pl-4">
              {/* Eyebrow */}
              <p className="text-xs font-bold uppercase text-(--primary) mb-1 sm:mb-4">
                Who We Are
              </p>

              {/* Heading — clean, no underline gimmick */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] mb-4">
                A non-profit built<br className="hidden sm:block" /> on trust &amp; service
              </h2>


              {/* Body copy */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-3 sm:mb-5">
                We are dedicated to improving lives through education, healthcare, and
                community support - one family at a time.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-3 sm:mb-8">
                Our mission is to bring hope and opportunities to underprivileged children
                and families. With the help of our volunteers and donors, we are creating a
                better future every single day.
              </p>

              {/* Checklist */}
              <ul className="space-y-1 mb-6 sm:mb-10">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    </span>
                    <span className="text-gray-600 text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-white text-sm font-semibold rounded-full  hover:-translate-y-0.5 transition-all duration-200"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/people/authors"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 text-sm font-semibold rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Meet the Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OurServices />
      <MeetOurTeam />
      <CommunityStats />
      <FAQ />
    </main>
  )
}

export default Home