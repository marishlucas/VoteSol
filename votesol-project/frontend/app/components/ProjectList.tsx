"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProjects, investInProject } from "@/utils/solana";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

interface Project {
  account: {
    title: string;
    description: string;
    target: number;
    amountCollected: number;
  };
  publicKey: PublicKey;
}

interface ProjectListProps {
  type: "user" | "other";
}

export default function ProjectList({ type }: ProjectListProps) {
  const wallet = useWallet();
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (wallet.publicKey) {
      setIsWalletReady(true);
    }
  }, [wallet.publicKey]);

  const fetcher = async () => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    //@ts-ignore
    const allProjects = await getProjects(wallet);
    return type === "user"
      ? allProjects.userProjects
      : allProjects.otherProjects;
  };

  const {
    data: projects,
    error,
    isValidating,
  } = useSWR(isWalletReady ? `projects-${type}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setDonationAmount("");
  };

  const handleDonate = async () => {
    if (!selectedProject || !wallet.publicKey || !wallet.signTransaction) {
      setErrorMessage("Wallet not connected or project not selected");
      setShowErrorModal(true);
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid donation amount");
      setShowErrorModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const signature = await investInProject(
        wallet,
        selectedProject.publicKey,
        selectedProject.account.title,
        amount * LAMPORTS_PER_SOL,
      );
      console.log("Donation successful, signature:", signature);
      setShowSuccessModal(true);
      mutate(`projects-${type}`);
    } catch (err) {
      console.error("Detailed donation error:", err);
      let errorMessage = "An unexpected error occurred during donation";
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        errorMessage = `${err.name}: ${err.message}`;
      }
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
      closeModal();
    }
  };

  if (!isWalletReady || isValidating) {
    return (
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg mb-4">{error.message}</div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <p className="text-center">
        No projects found. Be the first to create one!
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project: Project, index: number) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{project.account.title}</h2>
              <p>{project.account.description}</p>
              <p className="text-primary">
                Target: {(project.account.target / LAMPORTS_PER_SOL).toFixed(2)}{" "}
                SOL
              </p>
              <p className="text-secondary">
                Collected:{" "}
                {(project.account.amountCollected / LAMPORTS_PER_SOL).toFixed(
                  2,
                )}{" "}
                SOL
              </p>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-outline"
                  onClick={() => openModal(project)}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedProject && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {selectedProject.account.title}
            </h3>
            <p className="py-4">{selectedProject.account.description}</p>
            <p className="text-primary">
              Target:{" "}
              {(selectedProject.account.target / LAMPORTS_PER_SOL).toFixed(2)}{" "}
              SOL
            </p>
            <p className="text-secondary">
              Collected:{" "}
              {(
                selectedProject.account.amountCollected / LAMPORTS_PER_SOL
              ).toFixed(2)}{" "}
              SOL
            </p>
            <p className="text-accent">
              Progress:{" "}
              {(
                (selectedProject.account.amountCollected /
                  selectedProject.account.target) *
                100
              ).toFixed(2)}
              %
            </p>
            <div className="form-control w-full max-w-xs mt-4">
              <label className="label">
                <span className="label-text">Donation amount (SOL)</span>
              </label>
              <input
                type="text"
                placeholder="Enter amount"
                className="input input-bordered w-full max-w-xs"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleDonate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Donate"
                )}
              </button>
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Donation Successful!</h3>
            <p className="py-4">Thank you for your donation.</p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="py-4">{errorMessage}</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
