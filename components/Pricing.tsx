import { Card } from "./ui/card";
import TitleDot from "./TitleDot";
import { Button } from "./ui/button";
import Image from "next/image";

const Pricing = () => {
  const features = [
    {
      text: "Get access to all the courses and resources in period of 3 Months",
      icon: (
        <svg className="w-5 h-5 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      text: "Get access to all the courses, Job opportunities, Scholarships and Fundings",
      icon: (
        <svg className="w-5 h-5 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      text: "Referring to a friend and get 10% discount on our course if the referred buy our course",
      icon: (
        <svg className="w-5 h-5 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20 px-6 lg:px-10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#5AC35A]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 lg:items-start items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <TitleDot title={"Pricing"} className="text-2xl md:text-4xl font-bold" />
          <div className="flex items-center gap-3">
            <p className="text-gray-600 text-lg md:text-2xl font-medium">One time payment</p>
            <span className="px-4 py-1.5 bg-gradient-to-r from-[#5AC35A]/10 to-emerald-400/10 border border-[#5AC35A]/20 rounded-full text-[#5AC35A] text-sm font-semibold">
              Limited Offer
            </span>
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="relative bg-white flex flex-col lg:flex-row gap-8 lg:gap-12 p-8 lg:p-12 items-center border-2 border-gray-100 rounded-3xl shadow-2xl shadow-black/5 overflow-hidden group hover:border-[#5AC35A]/20 transition-all animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5AC35A]/0 via-[#5AC35A]/0 to-emerald-400/0 group-hover:from-[#5AC35A]/5 group-hover:to-emerald-400/5 transition-all duration-700 pointer-events-none"></div>

          {/* Image Section */}
          <div className="relative w-1/5 lg:block hidden">
            <div className="bg-[#37BB65] rounded-lg">
              <Image
                src="/assets/C2_1.png.png"
                width={100}
                height={400}
                alt="Gentle"
                priority
                className="w-full md:w-auto px-10 relative top-[-10px] md:top-[-40px] drop-shadow-[0_150px_25px_rgba(0,0,0,0.90)]"
                style={{ height: "370px", width: "content-fit" }}
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#5AC35A] to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#5AC35A]/30 transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
              <p className="text-xs font-semibold uppercase tracking-wide">Best Value</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative flex-1 flex flex-col space-y-6 w-full text-center lg:text-left z-10">
            {/* Title */}
            <div>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                Exclusive Access
              </h3>
              <p className="text-gray-600 text-base lg:text-lg">
                Everything you need to unlock your dream career
              </p>
            </div>

            {/* Features List */}
            <div className="flex flex-col space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 group/item animate-in fade-in slide-in-from-left duration-700"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#5AC35A]/10 to-emerald-400/10 rounded-lg flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-[#5AC35A]/20 transition-all duration-300">
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <p className="text-gray-700 text-base lg:text-lg font-medium leading-relaxed text-left">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <Button className="relative group/btn text-white text-lg font-bold bg-gradient-to-r from-[#5AC35A] to-[#00AE76] px-10 py-6 rounded-xl shadow-lg shadow-[#5AC35A]/30 hover:shadow-2xl hover:shadow-[#5AC35A]/40 transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <svg
                    className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
              </Button>

              {/* Trust badge */}
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-[#5AC35A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure checkout</span>
              </div>
            </div>

            {/* Additional info */}
            <p className="text-gray-500 text-sm pt-2">
              🎉 Join 1,000+ students who transformed their careers
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;