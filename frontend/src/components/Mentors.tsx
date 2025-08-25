import Header from './Header';
import MentorsList from './MentorsList';

const Mentors = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MentorsList />
      </div>
    </div>
  );
};

export default Mentors;
