'use client';

import Link from 'next/link';
import HomeFillIcon from './ui/icons/HomeFillIcon';
import HomeIcon from './ui/icons/HomeIcon';
import NewFillIcon from './ui/icons/NewFillIcon';
import NewIcon from './ui/icons/NewIcon';
import SearchFillIcon from './ui/icons/SearchFillIcon';
import SearchIcon from './ui/icons/SearchIcon';
import { usePathname } from 'next/navigation';
import ColorButton from './ui/ColorButton';

import { useSession, signIn, signOut } from 'next-auth/react';
import Avatar from './Avatar';

const menu = [
  {
    href: '/',
    icon: <HomeIcon />,
    clickedIcon: <HomeFillIcon />,
    title: 'Home',
    text: '홈',
  },
  {
    href: '/search',
    icon: <SearchIcon />,
    clickedIcon: <SearchFillIcon />,
    title: 'Search user',
    text: '검색',
  },
  {
    href: '/new',
    icon: <NewIcon />,
    clickedIcon: <NewFillIcon />,
    title: 'New post',
    text: '만들기',
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const pathName = usePathname();
  return (
    <div className="flex justify-between items-center px-4 xsm:px-6 xl:px-2 xl:py-10 xl:flex-col xl:gap-8">
      <Link href="/" aria-label="Home" className="w-6 overflow-hidden	xsm:w-auto">
        <h1
          className={`
            bg-[url('/assets/image/bslogo.png')] bg-white rounded-full text-transparent bg-contain bg-no-repeat 
            xsm:text-white xsm:rounded-none  xsm:bg-black xsm:text-1xl xsm:font-bold sm:text-3xl
          `}
        >
          Junsgram
        </h1>
      </Link>
      <nav className="xl:w-full xl:px-2">
        <ul className="flex gap-3 items-center p-1 xsm:p-4 xsm:gap-4 xl:flex-col xl:items-start xl:gap-6 xl:p-0">
          {menu.map((item) => (
            <li key={item.href} className="xl:w-full xl:px-4 py-2 xl:hover:bg-gray-800/80 xl:rounded-xl">
              <Link href={item.href} aria-label={item.title} className="xl:w-full xl:flex xl:items-end xl:gap-2 ">
                {pathName === item.href ? item.clickedIcon : item.icon}
                <p className={`hidden xl:inline xl:text-white ${pathName === item.href && 'font-bold'}`}>{item.text}</p>
              </Link>
            </li>
          ))}
          {user && ( //
            <li className="xl:w-full xl:px-4 py-2 xl:hover:bg-gray-800/80 xl:rounded-xl">
              <Link
                href={`/user/${user.username}`}
                aria-label="User page"
                className="xl:w-full xl:flex xl:items-center xl:gap-2"
              >
                <Avatar image={user.image} size="small" highlight={true} />
                <p className="hidden xl:inline text-white">프로필</p>
              </Link>
            </li>
          )}
          {session ? (
            <ColorButton text="Logout" onClick={() => signOut()} type="nav" />
          ) : (
            <ColorButton text="Login" onClick={() => signIn()} type="nav" />
          )}
        </ul>
      </nav>
    </div>
  );
}
