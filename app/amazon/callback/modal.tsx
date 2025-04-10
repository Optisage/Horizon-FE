import { Modal } from "antd";
import Image from "next/image";
import Link from "next/link";
import phone from "../../../public/assets/svg/phone.svg";
interface modal {
  isConnectedVisible: boolean;
  //setIsConnectedVisible: ()=> void,
}

export default function ConnectedModal({ isConnectedVisible }: modal) {
  return (
    <>
      <Modal
        className="cancel-modal "
        title=""
        open={isConnectedVisible}
        footer={null}
        maskClosable={false}
        width={400}
        closable={false}
        centered={true}
        styles={{
          content: { background: "#F6FDFB" },
        }}
      >
        <div className=" space-y-5 ">
          <div className=" flex justify-center">
            <div className=" size-36 rounded-full bg-slate-100 place-content-center place-items-center">
              <Image src={phone} alt="image" />
            </div>
          </div>

          <div className=" text-center">
            <h1 className=" text-lg font-semibold">Account Connected</h1>
            <h1 className=" font-semibold text-sm">
              The amazon account is already tied to an existing account, please
              use a different amazon account
            </h1>
          </div>
          <div className=" grid grid-cols-1 gap-4">
            <Link href={"/connect-amazon"} className=" w-full">
              <button className=" w-full text-white px-4 py-2 bg-[#18CB96] border rounded-lg font-medium !h-[40px] shadow-[0px_-3px_0px_0px_#0000001A_inset]">
                Use another account
              </button>
            </Link>

            <p className=" text-center text-xs text-[#5F6362]">
              <span>Have any issues? </span>
              <Link
                href={"https://optisage.ai/contact/"}
                className=" text-black font-semibold underline"
              >
                <span>Contact Support</span>
              </Link>
            </p>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .ant-modal-mask {
          backdrop-filter: blur(3px) !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>
    </>
  );
}

