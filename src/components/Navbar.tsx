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

// import mainLogo from './assets/image/bslogo.png';

import { useSession, signIn, signOut } from 'next-auth/react';
import Avatar from './Avatar';

const menu = [
  {
    href: '/',
    icon: <HomeIcon />,
    clickedIcon: <HomeFillIcon />,
    title: 'Home',
  },
  {
    href: '/search',
    icon: <SearchIcon />,
    clickedIcon: <SearchFillIcon />,
    title: 'Search user',
  },
  {
    href: '/new',
    icon: <NewIcon />,
    clickedIcon: <NewFillIcon />,
    title: 'New post',
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const pathName = usePathname();
  return (
    <div className="flex justify-between items-center px-2 xsm:px-6">
      <Link href="/" aria-label="Home" className="w-6	xsm:w-auto">
        <h1
          className={`
            bg-[url('/assets/image/bslogo.png')] text-transparent bg-contain bg-no-repeat 
            xsm:text-black  xsm:bg-none xsm:text-3xl xsm:font-bold
          `}
        >
          Junsgram
        </h1>
      </Link>
      <nav>
        <ul className="flex gap-4 items-center p-4">
          {menu.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-label={item.title}>
                {pathName === item.href ? item.clickedIcon : item.icon}
              </Link>
            </li>
          ))}
          {user && ( //
            <li>
              <Link href={`/user/${user.username}`} aria-label="User page">
                <Avatar image={user.image} size="small" highlight={true} />
              </Link>
            </li>
          )}
          {session ? (
            <ColorButton text="Sign out" onClick={() => signOut()} />
          ) : (
            <ColorButton text="Sign in" onClick={() => signIn()} />
          )}
        </ul>
      </nav>
    </div>
  );
}
