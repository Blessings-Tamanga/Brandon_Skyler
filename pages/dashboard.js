export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/dashboard.html',
      permanent: false
    }
  };
}

export default function DashboardPage() {
  return null;
}
