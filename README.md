# MacroScope Performance OS

MacroScope is a multi-platform Performance OS designed to track and optimize human performance across three core systems: **Sleep**, **Nutrition**, and **Activity**. Built with a focus on strict architectural separation and system-driven insights, it provides a unified experience across Web, Desktop, and Mobile.

![MacroScope Banner](https://i.ibb.co/TB6rCFvC/image.jpg)

## 🚀 Key Features

- **Unified Performance Tracking**: Monitor Sleep, Nutrition, and Activity in one centralized "Control Center".
- **Signal System**: Replaces traditional "insights" with automated, system-driven alerts that identify how one system affects another (e.g., *"Late meals are reducing sleep consistency"*).
- **Multi-Platform Support**: Cross-platform compatibility using a shared Core logic layer:
  - **Web**: Responsive React application.
  - **Desktop**: Electron-powered desktop experience.
  - **Mobile**: Expo/React Native mobile application.
- **Modern Tech Stack**: Built with Vite, React 18, TypeScript, and Tailwind CSS.
- **Real-time Backend**: Powered by Supabase for authentication and data persistence.

## 🏗 Architecture

MacroScope follows a strict layered architecture to ensure platform independence and scalability:

1.  **Core Layer (`/src/core`)**: Contains all platform-agnostic business logic, state management (hooks), and service definitions.
2.  **Platform Layer (`/src/web`, `/src/desktop`, `/src/mobile`)**: UI implementations specific to each platform, consuming the shared Core hooks.

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🛠 Tech Stack

- **Frontend**: [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Desktop**: [Electron](https://www.electronjs.org/)
- **Mobile**: [Expo](https://expo.dev/) / React Native
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend features)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/AnaySharmaCEO/macroscope.git
    cd macroscope
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    - **Web**: `npm run dev`
    - **Desktop**: `npm run desktop:dev`
    - **Mobile**: `cd src/mobile && npx expo start`

## 🔐 Security & Privacy

This project follows strict security practices:
- **Protected Source**: Proprietary mobile and desktop logic is excluded from public tracking.
- **Environment Isolation**: All API keys and secrets are managed via `.env` files and are never committed to the repository.
- **Secure Auth**: Industry-standard authentication via Supabase.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Built with precision by [Anay Sharma](https://github.com/AnaySharmaCEO)
