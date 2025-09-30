import Image from "next/image";

const CardImage = () => {
  return (
    <div className="bg-gradient-to-b from-[#5AC35A] via-[#00AE76] to-[#000] rounded-r-3xl flex items-center justify-center h-[280px] w-[250px] lg:p-0 px-10 lg:h-[430px] lg:w-[250px] xl:h-[400px] xl:w-[400px] 4k:h-[500px] 4k:w-[400px]">
      <Image
        src="/assets/Standing_ladies.png"
        height={450}
        width={250}
        priority
        alt="Header"
        className="object-contain drop-shadow-2xl"
        style={{ height: "550px", width: "100%" }}
      />
    </div>
  );
};

export default CardImage;
