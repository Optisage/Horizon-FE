 

"use client";
import { useReverseSearchMutation } from '@/redux/api/quickSearchApi';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Loader from '@/utils/loader';

export default function ReverseSearch() {
    const params = useSearchParams();
    const router = useRouter();
    const seller_id = params.get('seller_id') ?? '';
    const marketplaceId = params.get('marketplace_id') ? parseInt(params.get('marketplace_id')!) : 1;
    const category_id = params.get('category_id') ? parseInt(params.get('category_id')!) : undefined;

    const [reverseSearch, { isLoading, isError }] = useReverseSearchMutation();
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        console.log('Reverse Search Effect - seller_id:', seller_id, 'hasTriggered:', hasTriggered);
        if (seller_id && !hasTriggered) {
            console.log('Triggering reverse search with:', { seller_id, marketplaceId, category_id });
            setHasTriggered(true);
            // Trigger the reverse search mutation
            reverseSearch({ seller_id, marketplaceId, category_id })
                .unwrap()
                .then((response) => {
                    console.log('Reverse search success:', response);
                    setShowModal(true);
                })
                .catch((err: unknown) => {
                    console.error('Reverse search error:', err);
                    const error = err as { data?: { message?: string } };
                    setErrorMessage(error?.data?.message || "Failed to initiate tactical search. Please try again.");
                    setShowModal(true);
                });
        }
    }, [seller_id, marketplaceId, category_id, hasTriggered, reverseSearch]);

    const handleClose = () => {
        setShowModal(false);
        router.push('/go-compare');
    };

    const handleSearchAgain = () => {
        setShowModal(false);
        router.push('/go-compare');
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!showModal) {
        return <Loader />;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                <div className="p-6 text-center">
                    <div className="mb-4">
                        {isError ? (
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        ) : (
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isError ? "Error" : "Success!"}
                    </h3>
                    <p className={`px-4 ${isError ? "text-red-600" : "text-gray-600"}`}>
                        {isError 
                            ? errorMessage 
                            : "Tactical search completed and response sent to your email address!"}
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                        <button
                            onClick={handleSearchAgain}
                            className={`px-6 py-2 border rounded-md transition-colors ${
                                isError 
                                    ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white" 
                                    : "border-[#18cb96] text-[#18cb96] hover:bg-[#18cb96] hover:text-white"
                            }`}
                        >
                            {isError ? "Try Again" : "Search Again"}
                        </button>
                        <button
                            onClick={handleClose}
                            className={`px-6 py-2 text-white rounded-md transition-colors ${
                                isError 
                                    ? "bg-red-500 hover:bg-red-600" 
                                    : "bg-[#18cb96] hover:bg-[#15b588]"
                            }`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
