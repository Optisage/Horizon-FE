import { Modal } from "antd";
import Link from "next/link";
import { AiOutlineStop } from "react-icons/ai";
interface modal{
    isConnectedVisible:boolean,
    //setIsConnectedVisible: ()=> void,
    
}

export default function ConnectedModal({
    isConnectedVisible,
}:modal){
   
    return (
        <>
        
        <Modal
         className="cancel-modal"
        title=""
        open={isConnectedVisible}
        footer={null}
        maskClosable={false}
        width={400}
        closable={false}
        centered={true}
        
      >
        <div className=" space-y-5">
          <div className=" flex justify-center">
            <div className=" size-16 rounded-full bg-slate-100 place-content-center place-items-center">
           <AiOutlineStop color="#FD3E3E" size={40} />
           </div>
          </div>

          <div className=" text-center">
            <h1 className=" text-lg font-semibold">Account Connected</h1>
            <h1 className=" font-semibold text-sm">
           This amazon account is already tied to an existing account , please use a different amazon account.
            </h1>
          </div>
          <div className=" grid grid-cols-1 gap-4">
         
            <Link href={'/connect-amazon'} className=" w-full">
            <button
              className=" w-full text-black px-4 py-2 bg-white border rounded-lg font-medium !h-[40px] shadow-[0px_4px_8px_0px_#00000029]"
            >
           Use different account
            </button>
            </Link>

           
          </div>
        </div>
      </Modal>
      
      <style jsx global>{`
        .ant-modal-mask {
          backdrop-filter: blur(3px) !important;
          background-color: rgba(0, 0, 0, .5) !important;
        }
      `}</style>
        </>
      
    )
    
}

