import React from "react";

const LegalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow">
                <h1 className="mb-2 text-4xl font-bold">Legal Information</h1>
                <p className="mb-8 text-sm text-gray-500">
                    Last Updated: June 3, 2026
                </p>

                {/* Privacy Policy */}
                <section id="privacy-policy" className="mb-12">
                    <h2 className="mb-4 text-2xl font-semibold">Privacy Policy</h2>

                    <p className="mb-4 text-gray-700">
                        This application provides social media management services through
                        integrations with Facebook and Instagram APIs.
                    </p>

                    <h3 className="mb-2 text-lg font-medium">
                        Information We Collect
                    </h3>
                    <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-700">
                        <li>Profile information provided through Meta Login.</li>
                        <li>Facebook and Instagram account identifiers.</li>
                        <li>Content submitted for publishing.</li>
                        <li>Usage analytics and application logs.</li>
                        <li>Device and browser information.</li>
                    </ul>

                    <h3 className="mb-2 text-lg font-medium">
                        How We Use Information
                    </h3>
                    <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-700">
                        <li>Provide publishing and scheduling functionality.</li>
                        <li>Manage connected social media accounts.</li>
                        <li>Improve security and performance.</li>
                        <li>Respond to support requests.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>

                    <h3 className="mb-2 text-lg font-medium">Data Sharing</h3>
                    <p className="text-gray-700">
                        We do not sell personal information. Data may be shared with
                        service providers required to operate the platform or when legally
                        required.
                    </p>
                </section>

                <div className="my-8 border-t" />

                {/* Terms of Service */}
                <section id="terms" className="mb-12">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Terms of Service
                    </h2>

                    <p className="mb-4 text-gray-700">
                        By using this application, you agree to these Terms of Service.
                    </p>

                    <ul className="list-disc space-y-2 pl-6 text-gray-700">
                        <li>You must comply with all applicable laws.</li>
                        <li>You must comply with Meta Platform Policies.</li>
                        <li>You are responsible for activity performed using your account.</li>
                        <li>
                            You may not use the platform for spam, abuse, or unlawful
                            activities.
                        </li>
                        <li>
                            We may modify or discontinue features at any time without prior
                            notice.
                        </li>
                    </ul>
                </section>

                <div className="my-8 border-t" />

                {/* Data Deletion */}
                <section id="data-deletion">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Data Deletion Instructions
                    </h2>

                    <p className="mb-4 text-gray-700">
                        Users may request deletion of their personal information associated
                        with this application.
                    </p>

                    <h3 className="mb-2 text-lg font-medium">
                        How to Request Deletion
                    </h3>

                    <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                        <li>Send an email to support@yourdomain.com.</li>
                        <li>Use the subject "Data Deletion Request".</li>
                        <li>Include your registered email address.</li>
                    </ol>

                    <h3 className="mt-6 mb-2 text-lg font-medium">
                        Processing Time
                    </h3>

                    <p className="text-gray-700">
                        Verified requests will be processed within a reasonable timeframe,
                        unless retention is required by law.
                    </p>
                </section>

                <div className="mt-12 border-t pt-6">
                    <p className="text-sm text-gray-500">
                        Contact: support@yourdomain.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;