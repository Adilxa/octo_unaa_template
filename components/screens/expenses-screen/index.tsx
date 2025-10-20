'use client';

import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import NewEmployeeBtn from '@/components/action-btns/newEmployeeBtn';
import OverheadCreateBtn from '@/components/action-btns/overheadCreateBtn';
import PackegesBtn from '@/components/action-btns/PackegesBtn';
import EmployeeAnalytics from '@/components/employee-analytics';
import EmployeesInfo from '@/components/employees-info';
import ExpensesComunalList from '@/components/expenses-comunal';
import ExpensesDefaultList from '@/components/expenses-default';
import ExpensesMaterials from '@/components/expenses-materials';
import ExpensesOtherList from '@/components/expenses-other';
import ExpensesRentList from '@/components/expenses-rent';
import ExpensesSalaryList from '@/components/expenses-salary';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import UiFolder from '@/components/ui/ui-folder';

interface IFolderArr {
  title: string;
  link: string;
  id?: number | string;
}

const folderArr: IFolderArr[] = [
  {
    title: 'Материалы',
    link: 'materials',
  },
  {
    title: 'Зарплата',
    link: 'salaries',
  },
  // {
  //   title: 'Коммунальные',
  //   link: 'utilities',
  // },
  // {
  //   title: 'Прочие',
  //   link: 'more',
  // },
];

const tabsArr = [
  {
    link: 'day',
    name: 'День',
  },
  {
    link: 'week',
    name: 'Неделя',
  },
  {
    link: 'month',
    name: 'Месяц',
  },
];

const fetchCategories = async () => {
  const res = await $api.get('/overhead/categories/list/');
  return res.data;
};

const ExpensesScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([...folderArr]);

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: () => fetchCategories(),
  });

  useEffect(() => {
    if (categoriesData) {
      // Process the API data to ensure each category has a link property
      const processedCategories = categoriesData.map((category: any) => {
        // If the category already has a link property, use it
        // Otherwise, create a link property that matches the title (converted to lowercase)
        if (!category.link) {
          return {
            ...category,
            link: category?.title?.toLowerCase()?.replace(/\s+/g, '_'),
          };
        }
        return category;
      });

      // Filter out any categories from API that match our static ones by title
      const staticCategoryTitles = folderArr.map(item => item.title.toLowerCase());
      const filteredApiCategories = processedCategories.filter(
        (category: any) => !staticCategoryTitles.includes(category.title.toLowerCase()),
      );

      setCategories([...folderArr, ...filteredApiCategories]);
    }
  }, [categoriesLoading, categoriesData]);

  useEffect(() => {
    if (!currentTab) {
      router.push('/expenses?tab=materials&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  console.log(categories);

  const renderConstent = () => {
    switch (currentTab) {
      case 'materials':
        return <ExpensesMaterials />;
      case 'salaries':
        return <ExpensesSalaryList />;
      default:
        // eslint-disable-next-line no-case-declarations
        const dynamicCategory: any = categories.find(cat => cat.link && cat.link === currentTab);
        if (dynamicCategory) {
          return <ExpensesDefaultList id={dynamicCategory?.id} />;
        }
        return null;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Расходы'}
        underTitle={'Список'}
        showCalendar={true}
        showButton={true}
        btn={<OverheadCreateBtn />}
        showSearchInput={true}
        criteriaArr={tabsArr}
        // byCriteriaText={'Дата/Период'}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={categories} children={renderConstent()} />
    </Layout>
  );
};

export default ExpensesScreen;
